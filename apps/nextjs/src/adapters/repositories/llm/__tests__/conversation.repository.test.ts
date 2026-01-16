import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { ConversationMetadata } from "@/domain/llm/conversation/value-objects/conversation-metadata.vo";
import { ConversationTitle } from "@/domain/llm/conversation/value-objects/conversation-title.vo";
import { DrizzleConversationRepository } from "../conversation.repository";

vi.mock("@packages/drizzle", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
  },
  eq: vi.fn(),
  desc: vi.fn(),
}));

vi.mock("@packages/drizzle/schema", () => ({
  conversation: { id: "id", userId: "userId" },
  message: { id: "id", conversationId: "conversationId" },
}));

describe("DrizzleConversationRepository", () => {
  let repository: DrizzleConversationRepository;
  const testId = "550e8400-e29b-41d4-a716-446655440000";
  const testUserId = "user-123";

  const createTestConversation = (id?: string): Conversation => {
    const title = ConversationTitle.create(
      "Test Conversation" as string,
    ).getValue();
    const metadata = new ConversationMetadata({ key: "value" });

    return Conversation.create(
      {
        userId: testUserId,
        title: Option.some(title),
        metadata: Option.some(metadata),
      },
      new UUID(id ?? testId),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleConversationRepository();
  });

  describe("create()", () => {
    it("should create a conversation and return Result.ok", async () => {
      const conversation = createTestConversation();

      const result = await repository.create(conversation);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(conversation);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const conversation = createTestConversation();
      const result = await repository.create(conversation);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to create");
    });
  });

  describe("update()", () => {
    it("should update a conversation and return Result.ok", async () => {
      const conversation = createTestConversation();
      conversation.markUpdated();

      const result = await repository.update(conversation);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(conversation);
    });

    it("should return Result.fail when update fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error("Update error");
      });

      const conversation = createTestConversation();
      const result = await repository.update(conversation);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to update");
    });
  });

  describe("delete()", () => {
    it("should delete a conversation and return Result.ok with id", async () => {
      const conversationId = ConversationId.create(new UUID(testId));

      const result = await repository.delete(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(testId);
    });

    it("should return Result.fail when delete fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error("Delete error");
      });

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.delete(conversationId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to delete");
    });
  });

  describe("findById()", () => {
    it("should return Option.some when conversation exists", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecord = {
        id: testId,
        userId: testUserId,
        title: "Test Conversation",
        metadata: { key: "value" },
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.findById(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
      const conversation = result.getValue().unwrap();
      expect(conversation.id.value).toBe(testId);
    });

    it("should return Option.none when conversation does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.findById(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.findById(conversationId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to find");
    });
  });

  describe("findByUserId()", () => {
    it("should return paginated conversations for user", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecords = [
        {
          id: testId,
          userId: testUserId,
          title: "Test Conversation",
          metadata: null,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(mockRecords),
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findByUserId(testUserId, {
        page: 1,
        limit: 20,
      });

      expect(result.isSuccess).toBe(true);
      const paginated = result.getValue();
      expect(paginated.data.length).toBe(1);
      expect(paginated.pagination.page).toBe(1);
    });

    it("should use default pagination when not provided", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findByUserId(testUserId);

      expect(result.isSuccess).toBe(true);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const result = await repository.findByUserId(testUserId);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("getWithMessages()", () => {
    it("should return conversation with messages", async () => {
      const { db } = await import("@packages/drizzle");
      const mockResult = [
        {
          conversation: {
            id: testId,
            userId: testUserId,
            title: "Test",
            metadata: null,
            createdAt: new Date(),
            updatedAt: null,
          },
          message: {
            id: "msg-1",
            conversationId: testId,
            role: "user" as const,
            content: "Hello",
            model: null,
            inputTokens: null,
            outputTokens: null,
            totalTokens: null,
            costAmount: null,
            costCurrency: "USD",
            createdAt: new Date(),
          },
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockResult),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.getWithMessages(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
      const data = result.getValue().unwrap();
      expect(data.conversation.id.value).toBe(testId);
      expect(data.messages.length).toBeGreaterThan(0);
    });

    it("should return Option.none when conversation not found", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.getWithMessages(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe("findAll()", () => {
    it("should return paginated list of all conversations", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("exists()", () => {
    it("should return true when conversation exists", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testId }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.exists(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it("should return false when conversation does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(new UUID(testId));
      const result = await repository.exists(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });
  });

  describe("count()", () => {
    it("should return total count of conversations", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockResolvedValue([{}, {}, {}]),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.count();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(3);
    });
  });
});
