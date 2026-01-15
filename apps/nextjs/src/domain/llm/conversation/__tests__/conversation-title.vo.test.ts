import { describe, expect, it } from "vitest";
import { ConversationTitle } from "../value-objects/conversation-title.vo";

describe("ConversationTitle Value Object", () => {
  describe("create()", () => {
    it("should create valid title", () => {
      const result = ConversationTitle.create("My Conversation" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("My Conversation");
    });

    it("should create title with 1 character (minimum)", () => {
      const result = ConversationTitle.create("A" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("A");
    });

    it("should create title with 200 characters (maximum)", () => {
      const title = "a".repeat(200);
      const result = ConversationTitle.create(title);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(title);
    });

    it("should fail for empty title", () => {
      const result = ConversationTitle.create("" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Title is required");
    });

    it("should fail for title too long (201 characters)", () => {
      const title = "a".repeat(201);
      const result = ConversationTitle.create(title);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Title must be less than 200 characters");
    });

    it("should trim whitespace from title", () => {
      const result = ConversationTitle.create("  My Title  " as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("My Title");
    });

    it("should fail for whitespace-only title after trimming", () => {
      const result = ConversationTitle.create("   " as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Title is required");
    });
  });

  describe("equals()", () => {
    it("should be equal by value", () => {
      const title1 = ConversationTitle.create(
        "My Conversation" as string,
      ).getValue();
      const title2 = ConversationTitle.create(
        "My Conversation" as string,
      ).getValue();

      expect(title1.equals(title2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const title1 = ConversationTitle.create("Title One" as string).getValue();
      const title2 = ConversationTitle.create("Title Two" as string).getValue();

      expect(title1.equals(title2)).toBe(false);
    });
  });
});
