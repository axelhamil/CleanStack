import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationMetadata } from "@/domain/llm/conversation/value-objects/conversation-metadata.vo";
import { ConversationTitle } from "@/domain/llm/conversation/value-objects/conversation-title.vo";
import {
  conversationToDomain,
  conversationToPersistence,
} from "../conversation.mapper";

describe("ConversationMapper", () => {
  const testId = "550e8400-e29b-41d4-a716-446655440000";
  const testUserId = "user-123";
  const testTitle = "Test Conversation";
  const testMetadata = { key: "value" };
  const testCreatedAt = new Date("2024-01-01T00:00:00Z");
  const testUpdatedAt = new Date("2024-01-02T00:00:00Z");

  describe("conversationToDomain()", () => {
    describe("happy path", () => {
      it("should convert a DB record to domain Conversation", () => {
        const record = {
          id: testId,
          userId: testUserId,
          title: testTitle,
          metadata: testMetadata,
          createdAt: testCreatedAt,
          updatedAt: testUpdatedAt,
        };

        const result = conversationToDomain(record);

        expect(result.isSuccess).toBe(true);
        const conversation = result.getValue();
        expect(conversation.id.value).toBe(testId);
        expect(conversation.get("userId")).toBe(testUserId);
        expect(conversation.get("title").isSome()).toBe(true);
        expect(conversation.get("metadata").isSome()).toBe(true);
        expect(conversation.get("createdAt")).toEqual(testCreatedAt);
        expect(conversation.get("updatedAt")).toEqual(testUpdatedAt);
      });

      it("should handle null title as Option.none()", () => {
        const record = {
          id: testId,
          userId: testUserId,
          title: null,
          metadata: null,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = conversationToDomain(record);

        expect(result.isSuccess).toBe(true);
        const conversation = result.getValue();
        expect(conversation.get("title").isNone()).toBe(true);
      });

      it("should handle null metadata as Option.none()", () => {
        const record = {
          id: testId,
          userId: testUserId,
          title: testTitle,
          metadata: null,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = conversationToDomain(record);

        expect(result.isSuccess).toBe(true);
        const conversation = result.getValue();
        expect(conversation.get("metadata").isNone()).toBe(true);
      });

      it("should handle null updatedAt as undefined", () => {
        const record = {
          id: testId,
          userId: testUserId,
          title: testTitle,
          metadata: testMetadata,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = conversationToDomain(record);

        expect(result.isSuccess).toBe(true);
        const conversation = result.getValue();
        expect(conversation.getProps().updatedAt).toBeUndefined();
      });
    });

    describe("error handling", () => {
      it("should fail when title is invalid (too long)", () => {
        const record = {
          id: testId,
          userId: testUserId,
          title: "a".repeat(201),
          metadata: null,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = conversationToDomain(record);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("Title");
      });
    });
  });

  describe("conversationToPersistence()", () => {
    let conversation: Conversation;

    beforeEach(() => {
      const titleResult = ConversationTitle.create(testTitle as string);
      const metadataResult = ConversationMetadata.create(
        testMetadata as Record<string, unknown> | null,
      );

      conversation = Conversation.create(
        {
          userId: testUserId,
          title: Option.some(titleResult.getValue()),
          metadata: Option.some(metadataResult.getValue()),
        },
        new UUID(testId),
      );
    });

    it("should convert domain Conversation to persistence format", () => {
      const persistence = conversationToPersistence(conversation);

      expect(persistence.id).toBe(testId);
      expect(persistence.userId).toBe(testUserId);
      expect(persistence.title).toBe(testTitle);
      expect(persistence.metadata).toEqual(testMetadata);
      expect(persistence.createdAt).toBeInstanceOf(Date);
    });

    it("should convert Option.none() title to null", () => {
      const conversationWithoutTitle = Conversation.create(
        {
          userId: testUserId,
          title: Option.none(),
          metadata: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = conversationToPersistence(conversationWithoutTitle);

      expect(persistence.title).toBeNull();
    });

    it("should convert Option.none() metadata to null", () => {
      const conversationWithoutMetadata = Conversation.create(
        {
          userId: testUserId,
          title: Option.none(),
          metadata: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = conversationToPersistence(
        conversationWithoutMetadata,
      );

      expect(persistence.metadata).toBeNull();
    });

    it("should preserve updatedAt when present", () => {
      conversation.markUpdated();
      const persistence = conversationToPersistence(conversation);

      expect(persistence.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve data through domain -> persistence -> domain", () => {
      const titleResult = ConversationTitle.create(testTitle as string);
      const metadataResult = ConversationMetadata.create(
        testMetadata as Record<string, unknown> | null,
      );

      const original = Conversation.create(
        {
          userId: testUserId,
          title: Option.some(titleResult.getValue()),
          metadata: Option.some(metadataResult.getValue()),
        },
        new UUID(testId),
      );

      const persistence = conversationToPersistence(original);
      const domainResult = conversationToDomain({
        ...persistence,
        updatedAt: persistence.updatedAt ?? null,
      });

      expect(domainResult.isSuccess).toBe(true);
      const restored = domainResult.getValue();
      expect(restored.id.value).toBe(original.id.value);
      expect(restored.get("userId")).toBe(original.get("userId"));
    });
  });
});
