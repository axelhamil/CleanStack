import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { MessageId } from "@/domain/llm/conversation/entities/message-id";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import { MessageRole } from "@/domain/llm/conversation/value-objects/message-role.vo";
import { DrizzleMessageRepository } from "../message.repository";

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
    orderBy: vi.fn().mockResolvedValue([]),
  },
  eq: vi.fn(),
  desc: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@packages/drizzle/schema", () => ({
  message: { id: "id", conversationId: "conversationId" },
}));

describe("DrizzleMessageRepository", () => {
  let repository: DrizzleMessageRepository;
  const testMessageId = "660e8400-e29b-41d4-a716-446655440001";
  const testConversationId = "550e8400-e29b-41d4-a716-446655440000";

  const createTestMessage = (id?: string): Message => {
    const role = MessageRole.create(
      "user" as "user" | "assistant" | "system",
    ).getValue();
    const content = MessageContent.create("Hello, world!" as string).getValue();
    const conversationId = ConversationId.create(new UUID(testConversationId));

    return Message.create(
      {
        conversationId,
        role,
        content,
        model: Option.none(),
        tokenUsage: Option.none(),
        cost: Option.none(),
      },
      new UUID(id ?? testMessageId),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleMessageRepository();
  });

  describe("create()", () => {
    it("should create a message and return Result.ok", async () => {
      const message = createTestMessage();

      const result = await repository.create(message);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(message);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const message = createTestMessage();
      const result = await repository.create(message);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to create");
    });
  });

  describe("update()", () => {
    it("should update a message and return Result.ok", async () => {
      const message = createTestMessage();

      const result = await repository.update(message);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(message);
    });

    it("should return Result.fail when update fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error("Update error");
      });

      const message = createTestMessage();
      const result = await repository.update(message);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to update");
    });
  });

  describe("delete()", () => {
    it("should delete a message and return Result.ok with id", async () => {
      const messageId = MessageId.create(new UUID(testMessageId));

      const result = await repository.delete(messageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(testMessageId);
    });

    it("should return Result.fail when delete fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error("Delete error");
      });

      const messageId = MessageId.create(new UUID(testMessageId));
      const result = await repository.delete(messageId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to delete");
    });
  });

  describe("findById()", () => {
    it("should return Option.some when message exists", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecord = {
        id: testMessageId,
        conversationId: testConversationId,
        role: "user" as const,
        content: "Hello",
        model: null,
        inputTokens: null,
        outputTokens: null,
        totalTokens: null,
        costAmount: null,
        costCurrency: "USD",
        createdAt: new Date(),
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const messageId = MessageId.create(new UUID(testMessageId));
      const result = await repository.findById(messageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
      const message = result.getValue().unwrap();
      expect(message.id.value).toBe(testMessageId);
    });

    it("should return Option.none when message does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const messageId = MessageId.create(new UUID(testMessageId));
      const result = await repository.findById(messageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe("findByConversationId()", () => {
    it("should return paginated messages for conversation", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecords = [
        {
          id: testMessageId,
          conversationId: testConversationId,
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

      const conversationId = ConversationId.create(
        new UUID(testConversationId),
      );
      const result = await repository.findByConversationId(conversationId, {
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

      const conversationId = ConversationId.create(
        new UUID(testConversationId),
      );
      const result = await repository.findByConversationId(conversationId);

      expect(result.isSuccess).toBe(true);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const conversationId = ConversationId.create(
        new UUID(testConversationId),
      );
      const result = await repository.findByConversationId(conversationId);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("countByConversationId()", () => {
    it("should return count of messages in conversation", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 5 }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(
        new UUID(testConversationId),
      );
      const result = await repository.countByConversationId(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(5);
    });

    it("should return 0 when no messages in conversation", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const conversationId = ConversationId.create(
        new UUID(testConversationId),
      );
      const result = await repository.countByConversationId(conversationId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(0);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const conversationId = ConversationId.create(
        new UUID(testConversationId),
      );
      const result = await repository.countByConversationId(conversationId);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("findAll()", () => {
    it("should return paginated list of all messages", async () => {
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
    it("should return true when message exists", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testMessageId }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const messageId = MessageId.create(new UUID(testMessageId));
      const result = await repository.exists(messageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it("should return false when message does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const messageId = MessageId.create(new UUID(testMessageId));
      const result = await repository.exists(messageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });
  });

  describe("count()", () => {
    it("should return total count of messages", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockResolvedValue([{}, {}]),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.count();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(2);
    });
  });
});
