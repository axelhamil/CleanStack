import { Option } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { Conversation } from "../conversation.aggregate";
import { ConversationCreatedEvent } from "../events/conversation-created.event";
import type { ConversationMetadata } from "../value-objects/conversation-metadata.vo";
import { ConversationTitle } from "../value-objects/conversation-title.vo";

describe("ConversationCreatedEvent", () => {
  const createConversation = (options?: {
    title?: string | null;
    userId?: string;
  }) => {
    const title =
      options?.title === null
        ? Option.none<ConversationTitle>()
        : Option.some(
            ConversationTitle.create(
              (options?.title ?? "Test Conversation") as string,
            ).getValue(),
          );

    return Conversation.create({
      userId: options?.userId ?? "user-123",
      title,
      metadata: Option.none<ConversationMetadata>(),
    });
  };

  describe("eventType", () => {
    it("should have correct eventType", () => {
      const conversation = createConversation();
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.eventType).toBe("conversation.created");
    });
  });

  describe("aggregateId", () => {
    it("should have correct aggregateId from conversation", () => {
      const conversation = createConversation();
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.aggregateId).toBe(conversation.id.value.toString());
    });

    it("should have aggregateId as string", () => {
      const conversation = createConversation();
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(typeof event.aggregateId).toBe("string");
    });
  });

  describe("payload", () => {
    it("should include conversationId in payload", () => {
      const conversation = createConversation();
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.payload.conversationId).toBe(
        conversation.id.value.toString(),
      );
    });

    it("should include userId in payload", () => {
      const conversation = createConversation({ userId: "user-456" });
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.payload.userId).toBe("user-456");
    });

    it("should include title in payload when present", () => {
      const conversation = createConversation({ title: "My Conversation" });
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.payload.title).toBe("My Conversation");
    });

    it("should have null title in payload when not present", () => {
      const conversation = createConversation({ title: null });
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.payload.title).toBeNull();
    });

    it("should have all required fields in payload", () => {
      const conversation = createConversation();
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.payload).toHaveProperty("conversationId");
      expect(event.payload).toHaveProperty("userId");
      expect(event.payload).toHaveProperty("title");
    });
  });

  describe("event creation", () => {
    it("should be instance of ConversationCreatedEvent", () => {
      const conversation = createConversation();
      const event = conversation.domainEvents[0];

      expect(event).toBeInstanceOf(ConversationCreatedEvent);
    });

    it("should have dateOccurred timestamp", () => {
      const beforeCreate = new Date();
      const conversation = createConversation();
      const afterCreate = new Date();
      const event = conversation.domainEvents[0] as ConversationCreatedEvent;

      expect(event.dateOccurred.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(event.dateOccurred.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    it("should have unique aggregateId per conversation", () => {
      const conversation1 = createConversation();
      const conversation2 = createConversation();
      const event1 = conversation1.domainEvents[0] as ConversationCreatedEvent;
      const event2 = conversation2.domainEvents[0] as ConversationCreatedEvent;

      expect(event1.aggregateId).not.toBe(event2.aggregateId);
    });
  });
});
