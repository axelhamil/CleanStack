import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetConversationInputDto } from "@/application/dto/llm/get-conversation.dto";
import type {
  IConversationRepository,
  IConversationWithMessages,
} from "@/application/ports/conversation.repository.port";
import { GetConversationUseCase } from "@/application/use-cases/llm/get-conversation.use-case";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "@/domain/llm/conversation/value-objects/message-role.vo";
import { UserId } from "@/domain/user/user-id";

describe("GetConversationUseCase", () => {
  let useCase: GetConversationUseCase;
  let mockConversationRepository: IConversationRepository;

  const conversationId = new UUID<string>();
  const userId = "user-123";

  const validInput: IGetConversationInputDto = {
    conversationId: conversationId.value.toString(),
    userId,
  };

  const createMockConversation = (ownerId: string = userId): Conversation => {
    return Conversation.create(
      {
        userId: UserId.create(new UUID(ownerId)),
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
      model: Option.none(),
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

    useCase = new GetConversationUseCase(mockConversationRepository);
  });

  describe("happy path", () => {
    it("should return conversation with messages when found", async () => {
      const mockConversation = createMockConversation();
      const mockMessages = [
        createMockMessage(mockConversation.id, "user", "Hello"),
        createMockMessage(mockConversation.id, "assistant", "Hi there!"),
      ];

      const mockResult: IConversationWithMessages = {
        conversation: mockConversation,
        messages: mockMessages,
      };

      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.some(mockResult)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.id).toBe(conversationId.value.toString());
      expect(output.messages).toHaveLength(2);
      expect(output.messages[0]?.role).toBe("user");
      expect(output.messages[0]?.content).toBe("Hello");
      expect(output.messages[1]?.role).toBe("assistant");
      expect(output.messages[1]?.content).toBe("Hi there!");
    });

    it("should return conversation with empty messages array when no messages exist", async () => {
      const mockConversation = createMockConversation();
      const mockResult: IConversationWithMessages = {
        conversation: mockConversation,
        messages: [],
      };

      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.some(mockResult)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.messages).toHaveLength(0);
    });

    it("should return correct date formats in output", async () => {
      const mockConversation = createMockConversation();
      const mockResult: IConversationWithMessages = {
        conversation: mockConversation,
        messages: [],
      };

      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.some(mockResult)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.createdAt).toBeDefined();
      expect(typeof output.createdAt).toBe("string");
    });
  });

  describe("not found scenarios", () => {
    it("should fail when conversation is not found", async () => {
      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation not found");
    });
  });

  describe("ownership verification", () => {
    it("should fail when conversation belongs to different user", async () => {
      const mockConversation = createMockConversation("different-user");
      const mockResult: IConversationWithMessages = {
        conversation: mockConversation,
        messages: [],
      };

      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.some(mockResult)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation access unauthorized");
    });

    it("should succeed when conversation belongs to requesting user", async () => {
      const mockConversation = createMockConversation(userId);
      const mockResult: IConversationWithMessages = {
        conversation: mockConversation,
        messages: [],
      };

      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.some(mockResult)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("repository error handling", () => {
    it("should fail when repository returns error", async () => {
      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.fail("Database connection error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database connection error");
    });
  });

  describe("input validation", () => {
    it("should query repository with correct conversation ID", async () => {
      const mockConversation = createMockConversation();
      const mockResult: IConversationWithMessages = {
        conversation: mockConversation,
        messages: [],
      };

      vi.mocked(mockConversationRepository.getWithMessages).mockResolvedValue(
        Result.ok(Option.some(mockResult)),
      );

      await useCase.execute(validInput);

      expect(mockConversationRepository.getWithMessages).toHaveBeenCalledTimes(
        1,
      );
      const calledArg = vi.mocked(mockConversationRepository.getWithMessages)
        .mock.calls[0]?.[0];
      expect(calledArg?.value.toString()).toBe(conversationId.value.toString());
    });
  });
});
