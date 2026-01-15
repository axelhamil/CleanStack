import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { ConversationId } from "../conversation-id";
import { Message } from "../entities/message.entity";
import { CompletionReceivedEvent } from "../events/completion-received.event";
import { Cost, type CostValue } from "../value-objects/cost.vo";
import { MessageContent } from "../value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "../value-objects/message-role.vo";
import {
  TokenUsage,
  type TokenUsageValue,
} from "../value-objects/token-usage.vo";

describe("CompletionReceivedEvent", () => {
  const createMessage = (options?: {
    model?: string | null;
    tokenUsage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
    } | null;
    cost?: { amount: number; currency: string } | null;
  }) => {
    const tokenUsage =
      options?.tokenUsage === null
        ? Option.none<TokenUsage>()
        : options?.tokenUsage
          ? Option.some(
              TokenUsage.create(
                options.tokenUsage as TokenUsageValue,
              ).getValue(),
            )
          : Option.none<TokenUsage>();

    const cost =
      options?.cost === null
        ? Option.none<Cost>()
        : options?.cost
          ? Option.some(Cost.create(options.cost as CostValue).getValue())
          : Option.none<Cost>();

    return Message.create({
      conversationId: ConversationId.create(new UUID()),
      role: MessageRole.create("assistant" as MessageRoleType).getValue(),
      content: MessageContent.create("AI response" as string).getValue(),
      model:
        options?.model === null
          ? Option.none<string>()
          : Option.some(options?.model ?? "gpt-4"),
      tokenUsage,
      cost,
    });
  };

  describe("eventType", () => {
    it("should have correct eventType", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(event.eventType).toBe("conversation.completion_received");
    });
  });

  describe("aggregateId", () => {
    it("should have aggregateId as conversationId", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(event.aggregateId).toBe(
        message.get("conversationId").value.toString(),
      );
    });

    it("should have aggregateId as string", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(typeof event.aggregateId).toBe("string");
    });
  });

  describe("payload with token usage", () => {
    it("should include inputTokens when present", () => {
      const message = createMessage({
        tokenUsage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.inputTokens).toBe(100);
    });

    it("should include outputTokens when present", () => {
      const message = createMessage({
        tokenUsage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.outputTokens).toBe(50);
    });

    it("should include totalTokens when present", () => {
      const message = createMessage({
        tokenUsage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 },
      });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.totalTokens).toBe(150);
    });

    it("should have null token fields when not present", () => {
      const message = createMessage({ tokenUsage: null });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.inputTokens).toBeNull();
      expect(event.payload.outputTokens).toBeNull();
      expect(event.payload.totalTokens).toBeNull();
    });
  });

  describe("payload with cost", () => {
    it("should include cost amount when present", () => {
      const message = createMessage({
        cost: { amount: 0.05, currency: "USD" },
      });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.cost).toBe(0.05);
    });

    it("should include cost currency when present", () => {
      const message = createMessage({
        cost: { amount: 0.05, currency: "EUR" },
      });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.currency).toBe("EUR");
    });

    it("should have null cost fields when not present", () => {
      const message = createMessage({ cost: null });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.cost).toBeNull();
      expect(event.payload.currency).toBeNull();
    });
  });

  describe("payload with model", () => {
    it("should include model when present", () => {
      const message = createMessage({ model: "claude-3-opus" });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.model).toBe("claude-3-opus");
    });

    it("should have null model when not present", () => {
      const message = createMessage({ model: null });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.model).toBeNull();
    });
  });

  describe("payload completeness", () => {
    it("should have all required fields in payload", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(event.payload).toHaveProperty("conversationId");
      expect(event.payload).toHaveProperty("messageId");
      expect(event.payload).toHaveProperty("model");
      expect(event.payload).toHaveProperty("inputTokens");
      expect(event.payload).toHaveProperty("outputTokens");
      expect(event.payload).toHaveProperty("totalTokens");
      expect(event.payload).toHaveProperty("cost");
      expect(event.payload).toHaveProperty("currency");
    });

    it("should include conversationId in payload", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.conversationId).toBe(
        message.get("conversationId").value.toString(),
      );
    });

    it("should include messageId in payload", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.messageId).toBe(message.id.value.toString());
    });
  });

  describe("full completion event", () => {
    it("should capture all completion data", () => {
      const message = createMessage({
        model: "gpt-4-turbo",
        tokenUsage: { inputTokens: 500, outputTokens: 200, totalTokens: 700 },
        cost: { amount: 0.15, currency: "USD" },
      });
      const event = new CompletionReceivedEvent(message);

      expect(event.payload.model).toBe("gpt-4-turbo");
      expect(event.payload.inputTokens).toBe(500);
      expect(event.payload.outputTokens).toBe(200);
      expect(event.payload.totalTokens).toBe(700);
      expect(event.payload.cost).toBe(0.15);
      expect(event.payload.currency).toBe("USD");
    });
  });

  describe("event creation", () => {
    it("should be instance of CompletionReceivedEvent", () => {
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);

      expect(event).toBeInstanceOf(CompletionReceivedEvent);
    });

    it("should have dateOccurred timestamp", () => {
      const beforeCreate = new Date();
      const message = createMessage();
      const event = new CompletionReceivedEvent(message);
      const afterCreate = new Date();

      expect(event.dateOccurred.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(event.dateOccurred.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it("should create new event instance each time", () => {
      const message = createMessage();
      const event1 = new CompletionReceivedEvent(message);
      const event2 = new CompletionReceivedEvent(message);

      expect(event1).not.toBe(event2);
    });
  });
});
