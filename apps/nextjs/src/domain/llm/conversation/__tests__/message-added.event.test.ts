import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { ConversationId } from "../conversation-id";
import { Message } from "../entities/message.entity";
import { MessageAddedEvent } from "../events/message-added.event";
import type { Cost } from "../value-objects/cost.vo";
import { MessageContent } from "../value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "../value-objects/message-role.vo";
import type { TokenUsage } from "../value-objects/token-usage.vo";

describe("MessageAddedEvent", () => {
  const createMessage = (options?: {
    role?: "user" | "assistant" | "system";
    content?: string;
    model?: string | null;
  }) => {
    return Message.create({
      conversationId: ConversationId.create(new UUID()),
      role: MessageRole.create(
        (options?.role ?? "user") as MessageRoleType,
      ).getValue(),
      content: MessageContent.create(
        (options?.content ?? "Hello, world!") as string,
      ).getValue(),
      model:
        options?.model === null
          ? Option.none<string>()
          : Option.some(options?.model ?? "gpt-4"),
      tokenUsage: Option.none<TokenUsage>(),
      cost: Option.none<Cost>(),
    });
  };

  describe("eventType", () => {
    it("should have correct eventType", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(event.eventType).toBe("conversation.message_added");
    });
  });

  describe("aggregateId", () => {
    it("should have aggregateId as conversationId", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(event.aggregateId).toBe(
        message.get("conversationId").value.toString(),
      );
    });

    it("should have aggregateId as string", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(typeof event.aggregateId).toBe("string");
    });
  });

  describe("payload", () => {
    it("should include conversationId in payload", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(event.payload.conversationId).toBe(
        message.get("conversationId").value.toString(),
      );
    });

    it("should include messageId in payload", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(event.payload.messageId).toBe(message.id.value.toString());
    });

    it("should include role in payload", () => {
      const message = createMessage({ role: "assistant" });
      const event = new MessageAddedEvent(message);

      expect(event.payload.role).toBe("assistant");
    });

    it("should include content in payload", () => {
      const message = createMessage({ content: "Test message content" });
      const event = new MessageAddedEvent(message);

      expect(event.payload.content).toBe("Test message content");
    });

    it("should include model in payload when present", () => {
      const message = createMessage({ model: "claude-3" });
      const event = new MessageAddedEvent(message);

      expect(event.payload.model).toBe("claude-3");
    });

    it("should have null model in payload when not present", () => {
      const message = createMessage({ model: null });
      const event = new MessageAddedEvent(message);

      expect(event.payload.model).toBeNull();
    });

    it("should have all required fields in payload", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(event.payload).toHaveProperty("conversationId");
      expect(event.payload).toHaveProperty("messageId");
      expect(event.payload).toHaveProperty("role");
      expect(event.payload).toHaveProperty("content");
      expect(event.payload).toHaveProperty("model");
    });
  });

  describe("event for different roles", () => {
    it("should create event for user message", () => {
      const message = createMessage({ role: "user" });
      const event = new MessageAddedEvent(message);

      expect(event.payload.role).toBe("user");
    });

    it("should create event for assistant message", () => {
      const message = createMessage({ role: "assistant" });
      const event = new MessageAddedEvent(message);

      expect(event.payload.role).toBe("assistant");
    });

    it("should create event for system message", () => {
      const message = createMessage({ role: "system" });
      const event = new MessageAddedEvent(message);

      expect(event.payload.role).toBe("system");
    });
  });

  describe("event creation", () => {
    it("should be instance of MessageAddedEvent", () => {
      const message = createMessage();
      const event = new MessageAddedEvent(message);

      expect(event).toBeInstanceOf(MessageAddedEvent);
    });

    it("should have dateOccurred timestamp", () => {
      const beforeCreate = new Date();
      const message = createMessage();
      const event = new MessageAddedEvent(message);
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
      const event1 = new MessageAddedEvent(message);
      const event2 = new MessageAddedEvent(message);

      expect(event1).not.toBe(event2);
    });
  });
});
