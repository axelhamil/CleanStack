import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IListMessagesInputDto } from "@/application/dto/llm/list-messages.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import { ListMessagesUseCase } from "@/application/use-cases/llm/list-messages.use-case";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "@/domain/llm/conversation/value-objects/message-role.vo";

describe("ListMessagesUseCase", () => {
  let useCase: ListMessagesUseCase;
  let mockConversationRepository: IConversationRepository;
  let mockMessageRepository: IMessageRepository;

  const conversationId = new UUID<string>();
  const userId = "user-123";

  const validInput: IListMessagesInputDto = {
    conversationId: conversationId.value.toString(),
    userId,
  };

  const validInputWithPagination: IListMessagesInputDto = {
    conversationId: conversationId.value.toString(),
    userId,
    pagination: {
      page: 2,
      limit: 25,
    },
  };

  const createMockConversation = (ownerId: string = userId): Conversation => {
    return Conversation.create(
      {
        userId: ownerId,
        title: Option.none(),
        metadata: Option.none(),
      },
      conversationId,
    );
  };

  const createMockMessage = (
    convId: ConversationId,
    role: MessageRoleType,
    content: string,
  ): Message => {
    const roleResult = MessageRole.create(role);
    const contentResult = MessageContent.create(content);

    return Message.create({
      conversationId: convId,
      role: roleResult.getValue(),
      content: contentResult.getValue(),
      model: role === "assistant" ? Option.some("gpt-4o-mini") : Option.none(),
      tokenUsage: Option.none(),
      cost: Option.none(),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockConversationRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      getWithMessages: vi.fn(),
    };

    mockMessageRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByConversationId: vi.fn(),
      countByConversationId: vi.fn(),
    };

    useCase = new ListMessagesUseCase(
      mockConversationRepository,
      mockMessageRepository,
    );
  });

  describe("happy path", () => {
    it("should return paginated messages for conversation", async () => {
      const mockConversation = createMockConversation();
      const mockConvId = ConversationId.create(conversationId);
      const mockMessages = [
        createMockMessage(mockConvId, "user", "Hello"),
        createMockMessage(mockConvId, "assistant", "Hi there!"),
        createMockMessage(mockConvId, "user", "How are you?"),
      ];

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: mockMessages,
          pagination: {
            page: 1,
            limit: 20,
            total: 3,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.messages).toHaveLength(3);
      expect(output.messages[0]?.role).toBe("user");
      expect(output.messages[0]?.content).toBe("Hello");
      expect(output.messages[1]?.role).toBe("assistant");
      expect(output.messages[1]?.content).toBe("Hi there!");
      expect(output.messages[2]?.content).toBe("How are you?");
    });

    it("should return empty messages array when conversation has no messages", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.messages).toHaveLength(0);
      expect(output.pagination.total).toBe(0);
    });

    it("should return correct pagination metadata", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 2,
            limit: 25,
            total: 100,
            totalPages: 4,
            hasNextPage: true,
            hasPreviousPage: true,
          },
        }),
      );

      const result = await useCase.execute(validInputWithPagination);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.pagination.page).toBe(2);
      expect(output.pagination.limit).toBe(25);
      expect(output.pagination.total).toBe(100);
      expect(output.pagination.totalPages).toBe(4);
      expect(output.pagination.hasNextPage).toBe(true);
      expect(output.pagination.hasPreviousPage).toBe(true);
    });
  });

  describe("ownership verification", () => {
    it("should fail when conversation belongs to different user", async () => {
      const mockConversation = createMockConversation("different-user");

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation access unauthorized");
    });

    it("should succeed when conversation belongs to requesting user", async () => {
      const mockConversation = createMockConversation(userId);

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("not found scenarios", () => {
    it("should fail when conversation is not found", async () => {
      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation not found");
    });
  });

  describe("error handling", () => {
    it("should fail when conversation repository returns error", async () => {
      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.fail("Database connection error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database connection error");
    });

    it("should fail when message repository returns error", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.fail("Message fetch error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Message fetch error");
    });
  });

  describe("input handling", () => {
    it("should pass pagination params to message repository", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 2,
            limit: 25,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      await useCase.execute(validInputWithPagination);

      expect(mockMessageRepository.findByConversationId).toHaveBeenCalledWith(
        expect.anything(),
        { page: 2, limit: 25 },
      );
    });

    it("should query repository with correct conversation ID", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      await useCase.execute(validInput);

      const calledArg = vi.mocked(mockMessageRepository.findByConversationId)
        .mock.calls[0]?.[0];
      expect(calledArg?.value.toString()).toBe(conversationId.value.toString());
    });
  });

  describe("output format", () => {
    it("should include all required fields in message output", async () => {
      const mockConversation = createMockConversation();
      const mockConvId = ConversationId.create(conversationId);
      const mockMessage = createMockMessage(mockConvId, "user", "Test message");

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockMessageRepository.findByConversationId).mockResolvedValue(
        Result.ok({
          data: [mockMessage],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      const msg = output.messages[0];

      expect(msg?.id).toBeDefined();
      expect(msg?.role).toBe("user");
      expect(msg?.content).toBe("Test message");
      expect(msg?.createdAt).toBeDefined();
      expect(typeof msg?.createdAt).toBe("string");
    });
  });
});
