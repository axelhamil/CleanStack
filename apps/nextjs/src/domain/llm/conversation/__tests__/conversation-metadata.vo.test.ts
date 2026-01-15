import { describe, expect, it } from "vitest";
import {
  ConversationMetadata,
  type ConversationMetadataValue,
} from "../value-objects/conversation-metadata.vo";

describe("ConversationMetadata Value Object", () => {
  describe("create()", () => {
    it("should create valid metadata with object", () => {
      const result = ConversationMetadata.create({
        source: "web",
        tags: ["ai", "chat"],
      } as ConversationMetadataValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toEqual({
        source: "web",
        tags: ["ai", "chat"],
      });
    });

    it("should create valid metadata with empty object", () => {
      const result = ConversationMetadata.create(
        {} as ConversationMetadataValue,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toEqual({});
    });

    it("should allow null metadata", () => {
      const result = ConversationMetadata.create(
        null as ConversationMetadataValue,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(null);
    });

    it("should create metadata with nested objects", () => {
      const result = ConversationMetadata.create({
        user: {
          preferences: {
            theme: "dark",
          },
        },
      } as ConversationMetadataValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toEqual({
        user: {
          preferences: {
            theme: "dark",
          },
        },
      });
    });

    it("should create metadata with mixed value types", () => {
      const result = ConversationMetadata.create({
        stringVal: "test",
        numberVal: 42,
        boolVal: true,
        arrayVal: [1, 2, 3],
        nullVal: null,
      } as ConversationMetadataValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toEqual({
        stringVal: "test",
        numberVal: 42,
        boolVal: true,
        arrayVal: [1, 2, 3],
        nullVal: null,
      });
    });
  });

  describe("equals()", () => {
    it("should be equal by value", () => {
      const meta1 = ConversationMetadata.create({
        key: "value",
      } as ConversationMetadataValue).getValue();
      const meta2 = ConversationMetadata.create({
        key: "value",
      } as ConversationMetadataValue).getValue();

      expect(meta1.equals(meta2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const meta1 = ConversationMetadata.create({
        key: "value1",
      } as ConversationMetadataValue).getValue();
      const meta2 = ConversationMetadata.create({
        key: "value2",
      } as ConversationMetadataValue).getValue();

      expect(meta1.equals(meta2)).toBe(false);
    });

    it("should be equal for two null values", () => {
      const meta1 = ConversationMetadata.create(
        null as ConversationMetadataValue,
      ).getValue();
      const meta2 = ConversationMetadata.create(
        null as ConversationMetadataValue,
      ).getValue();

      expect(meta1.equals(meta2)).toBe(true);
    });

    it("should be equal for two empty objects", () => {
      const meta1 = ConversationMetadata.create(
        {} as ConversationMetadataValue,
      ).getValue();
      const meta2 = ConversationMetadata.create(
        {} as ConversationMetadataValue,
      ).getValue();

      expect(meta1.equals(meta2)).toBe(true);
    });
  });
});
