import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IListConversationsInputDto } from "@/application/dto/llm/list-conversations.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import { ListConversationsUseCase } from "@/application/use-cases/llm/list-conversations.use-case";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationTitle } from "@/domain/llm/conversation/value-objects/conversation-title.vo";

describe("ListConversationsUseCase", () => {
  let useCase: ListConversationsUseCase;
  let mockConversationRepository: IConversationRepository;
  let mockMessageRepository: IMessageRepository;

  const userId = "user-123";

  const validInput: IListConversationsInputDto = {
    userId,
  };

  const validInputWithPagination: IListConversationsInputDto = {
    userId,
    pagination: {
      page: 2,
      limit: 10,
    },
  };

  const createMockConversation = (
    id: UUID<string>,
    title?: string,
  ): Conversation => {
    return Conversation.create(
      {
        userId,
        title: title
          ? Option.some(ConversationTitle.create(title).getValue())
          : Option.none(),
        metadata: Option.none(),
      },
      id,
    );
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

    useCase = new ListConversationsUseCase(
      mockConversationRepository,
      mockMessageRepository,
    );
  });

  describe("happy path", () => {
    it("should return paginated list of conversations", async () => {
      const conv1 = createMockConversation(new UUID<string>(), "First Chat");
      const conv2 = createMockConversation(
        new UUID<string>(),
        "Second Discussion",
      );

      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.ok({
          data: [conv1, conv2],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      vi.mocked(mockMessageRepository.countByConversationId)
        .mockResolvedValueOnce(Result.ok(5))
        .mockResolvedValueOnce(Result.ok(3));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversations).toHaveLength(2);
      expect(output.conversations[0]?.title).toBe("First Chat");
      expect(output.conversations[0]?.messageCount).toBe(5);
      expect(output.conversations[1]?.title).toBe("Second Discussion");
      expect(output.conversations[1]?.messageCount).toBe(3);
    });

    it("should return empty list when user has no conversations", async () => {
      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
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
      expect(output.conversations).toHaveLength(0);
      expect(output.pagination.total).toBe(0);
    });

    it("should return correct pagination metadata", async () => {
      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: true,
          },
        }),
      );

      const result = await useCase.execute(validInputWithPagination);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.pagination.page).toBe(2);
      expect(output.pagination.limit).toBe(10);
      expect(output.pagination.total).toBe(25);
      expect(output.pagination.totalPages).toBe(3);
      expect(output.pagination.hasNextPage).toBe(true);
      expect(output.pagination.hasPreviousPage).toBe(true);
    });

    it("should handle conversations with null titles", async () => {
      const conv = createMockConversation(new UUID<string>());

      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.ok({
          data: [conv],
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

      vi.mocked(mockMessageRepository.countByConversationId).mockResolvedValue(
        Result.ok(1),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversations[0]?.title).toBeNull();
    });
  });

  describe("filtering by userId", () => {
    it("should call repository with correct userId", async () => {
      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
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

      await useCase.execute({ userId: "specific-user-456" });

      expect(mockConversationRepository.findByUserId).toHaveBeenCalledWith(
        "specific-user-456",
        undefined,
      );
    });

    it("should pass pagination params to repository", async () => {
      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 2,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      await useCase.execute(validInputWithPagination);

      expect(mockConversationRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        { page: 2, limit: 10 },
      );
    });
  });

  describe("error handling", () => {
    it("should fail when conversation repository returns error", async () => {
      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.fail("Database connection error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database connection error");
    });

    it("should handle message count error gracefully", async () => {
      const conv = createMockConversation(new UUID<string>(), "Test Chat");

      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.ok({
          data: [conv],
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

      vi.mocked(mockMessageRepository.countByConversationId).mockResolvedValue(
        Result.fail("Count error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.conversations[0]?.messageCount).toBe(0);
    });
  });

  describe("output format", () => {
    it("should include all required fields in conversation summary", async () => {
      const conv = createMockConversation(new UUID<string>(), "Test Chat");

      vi.mocked(mockConversationRepository.findByUserId).mockResolvedValue(
        Result.ok({
          data: [conv],
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

      vi.mocked(mockMessageRepository.countByConversationId).mockResolvedValue(
        Result.ok(5),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      const summary = output.conversations[0];

      expect(summary?.id).toBeDefined();
      expect(summary?.title).toBe("Test Chat");
      expect(summary?.messageCount).toBe(5);
      expect(summary?.createdAt).toBeDefined();
      expect(typeof summary?.createdAt).toBe("string");
    });
  });
});
