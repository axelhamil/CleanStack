import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import {
  Conversation,
  type IConversationProps,
} from "../conversation.aggregate";
import { ConversationId } from "../conversation-id";
import { ConversationCreatedEvent } from "../events/conversation-created.event";
import {
  ConversationMetadata,
  type ConversationMetadataValue,
} from "../value-objects/conversation-metadata.vo";
import { ConversationTitle } from "../value-objects/conversation-title.vo";

describe("Conversation Aggregate", () => {
  const createValidProps = () => ({
    userId: "user-123",
    title: Option.some(
      ConversationTitle.create("Test Conversation" as string).getValue(),
    ),
    metadata: Option.none<ConversationMetadata>(),
  });

  describe("create()", () => {
    it("should create conversation with valid props", () => {
      const props = createValidProps();

      const conversation = Conversation.create(props);

      expect(conversation).toBeInstanceOf(Conversation);
      expect(conversation.id).toBeInstanceOf(ConversationId);
      expect(conversation.get("userId")).toBe("user-123");
      expect(conversation.get("title").isSome()).toBe(true);
      expect(conversation.get("title").unwrap().value).toBe(
        "Test Conversation",
      );
      expect(conversation.get("createdAt")).toBeInstanceOf(Date);
    });

    it("should emit ConversationCreatedEvent when no id provided", () => {
      const props = createValidProps();

      const conversation = Conversation.create(props);

      expect(conversation.domainEvents).toHaveLength(1);
      expect(conversation.domainEvents[0]).toBeInstanceOf(
        ConversationCreatedEvent,
      );
    });

    it("should NOT emit event when id is provided", () => {
      const props = createValidProps();
      const existingId = new UUID();

      const conversation = Conversation.create(props, existingId);

      expect(conversation.domainEvents).toHaveLength(0);
      expect(conversation.id.value).toBe(existingId.value);
    });

    it("should create conversation with provided id", () => {
      const props = createValidProps();
      const customId = new UUID();

      const conversation = Conversation.create(props, customId);

      expect(conversation.id.value).toBe(customId.value);
    });

    it("should generate new id when not provided", () => {
      const props = createValidProps();

      const conversation1 = Conversation.create(props);
      const conversation2 = Conversation.create(props);

      expect(conversation1.id.value).not.toBe(conversation2.id.value);
    });

    it("should set createdAt automatically", () => {
      const beforeCreate = new Date();
      const props = createValidProps();

      const conversation = Conversation.create(props);

      const afterCreate = new Date();
      const createdAt = conversation.get("createdAt");
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it("should create conversation with no title", () => {
      const props = {
        ...createValidProps(),
        title: Option.none<ConversationTitle>(),
      };

      const conversation = Conversation.create(props);

      expect(conversation.get("title").isNone()).toBe(true);
    });

    it("should create conversation with metadata", () => {
      const metadata = ConversationMetadata.create({
        source: "web",
        tags: ["ai"],
      } as ConversationMetadataValue).getValue();
      const props = {
        ...createValidProps(),
        metadata: Option.some(metadata),
      };

      const conversation = Conversation.create(props);

      expect(conversation.get("metadata").isSome()).toBe(true);
      expect(conversation.get("metadata").unwrap().value).toEqual({
        source: "web",
        tags: ["ai"],
      });
    });
  });

  describe("reconstitute()", () => {
    it("should reconstitute conversation from stored data", () => {
      const uuid = new UUID();
      const conversationId = ConversationId.create(uuid);
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const props: IConversationProps = {
        ...createValidProps(),
        createdAt,
      };

      const conversation = Conversation.reconstitute(props, conversationId);

      expect(conversation).toBeInstanceOf(Conversation);
      expect(conversation.id.value).toBe(uuid.value);
      expect(conversation.get("createdAt")).toBe(createdAt);
    });

    it("should NOT emit events when reconstituting", () => {
      const uuid = new UUID();
      const conversationId = ConversationId.create(uuid);
      const props: IConversationProps = {
        ...createValidProps(),
        createdAt: new Date(),
      };

      const conversation = Conversation.reconstitute(props, conversationId);

      expect(conversation.domainEvents).toHaveLength(0);
    });

    it("should preserve all props when reconstituting", () => {
      const uuid = new UUID();
      const conversationId = ConversationId.create(uuid);
      const metadata = ConversationMetadata.create({
        key: "value",
      } as ConversationMetadataValue).getValue();
      const updatedAt = new Date("2024-01-02T00:00:00Z");
      const props: IConversationProps = {
        userId: "user-456",
        title: Option.some(
          ConversationTitle.create("Old Title" as string).getValue(),
        ),
        metadata: Option.some(metadata),
        createdAt: new Date("2024-01-01T00:00:00Z"),
        updatedAt,
      };

      const conversation = Conversation.reconstitute(props, conversationId);

      expect(conversation.get("userId")).toBe("user-456");
      expect(conversation.get("title").unwrap().value).toBe("Old Title");
      expect(conversation.get("metadata").isSome()).toBe(true);
      expect(conversation.get("updatedAt")).toBe(updatedAt);
    });
  });

  describe("updateTitle()", () => {
    it("should update title", () => {
      const conversation = Conversation.create(createValidProps());
      const newTitle = ConversationTitle.create(
        "New Title" as string,
      ).getValue();

      conversation.updateTitle(Option.some(newTitle));

      expect(conversation.get("title").unwrap().value).toBe("New Title");
    });

    it("should set updatedAt when updating title", () => {
      const conversation = Conversation.create(createValidProps());
      const beforeUpdate = new Date();

      conversation.updateTitle(
        Option.some(ConversationTitle.create("New Title" as string).getValue()),
      );

      const afterUpdate = new Date();
      const updatedAt = conversation.get("updatedAt");
      expect(updatedAt).toBeDefined();
      expect(updatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(updatedAt!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it("should allow clearing title with None", () => {
      const conversation = Conversation.create(createValidProps());

      conversation.updateTitle(Option.none<ConversationTitle>());

      expect(conversation.get("title").isNone()).toBe(true);
    });
  });

  describe("updateMetadata()", () => {
    it("should update metadata", () => {
      const conversation = Conversation.create(createValidProps());
      const newMetadata = ConversationMetadata.create({
        updated: true,
      } as ConversationMetadataValue).getValue();

      conversation.updateMetadata(Option.some(newMetadata));

      expect(conversation.get("metadata").unwrap().value).toEqual({
        updated: true,
      });
    });

    it("should set updatedAt when updating metadata", () => {
      const conversation = Conversation.create(createValidProps());
      const beforeUpdate = new Date();

      conversation.updateMetadata(
        Option.some(
          ConversationMetadata.create({
            key: "value",
          } as ConversationMetadataValue).getValue(),
        ),
      );

      const afterUpdate = new Date();
      const updatedAt = conversation.get("updatedAt");
      expect(updatedAt).toBeDefined();
      expect(updatedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(updatedAt!.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
    });

    it("should allow clearing metadata with None", () => {
      const metadata = ConversationMetadata.create({
        key: "value",
      } as ConversationMetadataValue).getValue();
      const conversation = Conversation.create({
        ...createValidProps(),
        metadata: Option.some(metadata),
      });

      conversation.updateMetadata(Option.none<ConversationMetadata>());

      expect(conversation.get("metadata").isNone()).toBe(true);
    });
  });

  describe("markUpdated()", () => {
    it("should set updatedAt to current time", () => {
      const conversation = Conversation.create(createValidProps());
      const beforeMark = new Date();

      conversation.markUpdated();

      const afterMark = new Date();
      const updatedAt = conversation.get("updatedAt");
      expect(updatedAt).toBeDefined();
      expect(updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeMark.getTime());
      expect(updatedAt!.getTime()).toBeLessThanOrEqual(afterMark.getTime());
    });
  });

  describe("id", () => {
    it("should return ConversationId instance", () => {
      const conversation = Conversation.create(createValidProps());

      expect(conversation.id).toBeInstanceOf(ConversationId);
    });

    it("should return consistent id", () => {
      const conversation = Conversation.create(createValidProps());

      expect(conversation.id.value).toBe(conversation.id.value);
    });
  });
});
