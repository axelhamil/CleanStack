import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import { MessageRole } from "@/domain/llm/conversation/value-objects/message-role.vo";
import { TokenUsage } from "@/domain/llm/conversation/value-objects/token-usage.vo";
import { messageToDomain, messageToPersistence } from "../message.mapper";

describe("MessageMapper", () => {
  const testId = "550e8400-e29b-41d4-a716-446655440001";
  const testConversationId = "550e8400-e29b-41d4-a716-446655440000";
  const testContent = "Hello, world!";
  const testModel = "gpt-4o-mini";
  const testCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("messageToDomain()", () => {
    describe("happy path", () => {
      it("should convert a DB record to domain Message", () => {
        const record = {
          id: testId,
          conversationId: testConversationId,
          role: "user" as const,
          content: testContent,
          model: testModel,
          inputTokens: 10,
          outputTokens: 20,
          totalTokens: 30,
          costAmount: 0.001,
          costCurrency: "USD",
          createdAt: testCreatedAt,
        };

        const result = messageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const message = result.getValue();
        expect(message.id.value).toBe(testId);
        expect(message.get("conversationId").value).toBe(testConversationId);
        expect(message.get("role").value).toBe("user");
        expect(message.get("content").value).toBe(testContent);
        expect(message.get("model").isSome()).toBe(true);
        expect(message.get("tokenUsage").isSome()).toBe(true);
        expect(message.get("cost").isSome()).toBe(true);
      });

      it("should handle null model as Option.none()", () => {
        const record = {
          id: testId,
          conversationId: testConversationId,
          role: "assistant" as const,
          content: testContent,
          model: null,
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          costAmount: null,
          costCurrency: "USD",
          createdAt: testCreatedAt,
        };

        const result = messageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const message = result.getValue();
        expect(message.get("model").isNone()).toBe(true);
      });

      it("should handle null token usage as Option.none()", () => {
        const record = {
          id: testId,
          conversationId: testConversationId,
          role: "system" as const,
          content: testContent,
          model: testModel,
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          costAmount: null,
          costCurrency: "USD",
          createdAt: testCreatedAt,
        };

        const result = messageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const message = result.getValue();
        expect(message.get("tokenUsage").isNone()).toBe(true);
      });

      it("should handle null cost as Option.none()", () => {
        const record = {
          id: testId,
          conversationId: testConversationId,
          role: "user" as const,
          content: testContent,
          model: testModel,
          inputTokens: 10,
          outputTokens: 20,
          totalTokens: 30,
          costAmount: null,
          costCurrency: "USD",
          createdAt: testCreatedAt,
        };

        const result = messageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const message = result.getValue();
        expect(message.get("cost").isNone()).toBe(true);
      });
    });

    describe("error handling", () => {
      it("should fail when content is empty", () => {
        const record = {
          id: testId,
          conversationId: testConversationId,
          role: "user" as const,
          content: "",
          model: null,
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          costAmount: null,
          costCurrency: "USD",
          createdAt: testCreatedAt,
        };

        const result = messageToDomain(record);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("content");
      });
    });
  });

  describe("messageToPersistence()", () => {
    let message: Message;

    beforeEach(() => {
      const roleResult = MessageRole.create(
        "user" as "user" | "assistant" | "system",
      );
      const contentResult = MessageContent.create(testContent as string);
      const tokenUsageResult = TokenUsage.create({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      } as { inputTokens: number; outputTokens: number; totalTokens: number });
      const costResult = Cost.create({ amount: 0.001, currency: "USD" } as {
        amount: number;
        currency: string;
      });

      message = Message.create(
        {
          conversationId: ConversationId.create(new UUID(testConversationId)),
          role: roleResult.getValue(),
          content: contentResult.getValue(),
          model: Option.some(testModel),
          tokenUsage: Option.some(tokenUsageResult.getValue()),
          cost: Option.some(costResult.getValue()),
        },
        new UUID(testId),
      );
    });

    it("should convert domain Message to persistence format", () => {
      const persistence = messageToPersistence(message);

      expect(persistence.id).toBe(testId);
      expect(persistence.conversationId).toBe(testConversationId);
      expect(persistence.role).toBe("user");
      expect(persistence.content).toBe(testContent);
      expect(persistence.model).toBe(testModel);
      expect(persistence.inputTokens).toBe(10);
      expect(persistence.outputTokens).toBe(20);
      expect(persistence.totalTokens).toBe(30);
      expect(persistence.costAmount).toBe(0.001);
      expect(persistence.costCurrency).toBe("USD");
    });

    it("should convert Option.none() model to null", () => {
      const roleResult = MessageRole.create(
        "assistant" as "user" | "assistant" | "system",
      );
      const contentResult = MessageContent.create(testContent as string);

      const messageWithoutModel = Message.create(
        {
          conversationId: ConversationId.create(new UUID(testConversationId)),
          role: roleResult.getValue(),
          content: contentResult.getValue(),
          model: Option.none(),
          tokenUsage: Option.none(),
          cost: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = messageToPersistence(messageWithoutModel);

      expect(persistence.model).toBeNull();
    });

    it("should convert Option.none() tokenUsage to null values", () => {
      const roleResult = MessageRole.create(
        "assistant" as "user" | "assistant" | "system",
      );
      const contentResult = MessageContent.create(testContent as string);

      const messageWithoutUsage = Message.create(
        {
          conversationId: ConversationId.create(new UUID(testConversationId)),
          role: roleResult.getValue(),
          content: contentResult.getValue(),
          model: Option.some(testModel),
          tokenUsage: Option.none(),
          cost: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = messageToPersistence(messageWithoutUsage);

      expect(persistence.inputTokens).toBeNull();
      expect(persistence.outputTokens).toBeNull();
      expect(persistence.totalTokens).toBeNull();
    });

    it("should convert Option.none() cost to null values", () => {
      const roleResult = MessageRole.create(
        "assistant" as "user" | "assistant" | "system",
      );
      const contentResult = MessageContent.create(testContent as string);

      const messageWithoutCost = Message.create(
        {
          conversationId: ConversationId.create(new UUID(testConversationId)),
          role: roleResult.getValue(),
          content: contentResult.getValue(),
          model: Option.some(testModel),
          tokenUsage: Option.none(),
          cost: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = messageToPersistence(messageWithoutCost);

      expect(persistence.costAmount).toBeNull();
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve data through domain -> persistence -> domain", () => {
      const roleResult = MessageRole.create(
        "user" as "user" | "assistant" | "system",
      );
      const contentResult = MessageContent.create(testContent as string);
      const tokenUsageResult = TokenUsage.create({
        inputTokens: 10,
        outputTokens: 20,
        totalTokens: 30,
      } as { inputTokens: number; outputTokens: number; totalTokens: number });
      const costResult = Cost.create({ amount: 0.001, currency: "USD" } as {
        amount: number;
        currency: string;
      });

      const original = Message.create(
        {
          conversationId: ConversationId.create(new UUID(testConversationId)),
          role: roleResult.getValue(),
          content: contentResult.getValue(),
          model: Option.some(testModel),
          tokenUsage: Option.some(tokenUsageResult.getValue()),
          cost: Option.some(costResult.getValue()),
        },
        new UUID(testId),
      );

      const persistence = messageToPersistence(original);
      const domainResult = messageToDomain(persistence);

      expect(domainResult.isSuccess).toBe(true);
      const restored = domainResult.getValue();
      expect(restored.id.value).toBe(original.id.value);
      expect(restored.get("role").value).toBe(original.get("role").value);
      expect(restored.get("content").value).toBe(original.get("content").value);
    });
  });
});
