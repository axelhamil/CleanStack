import { describe, expect, it } from "vitest";
import { MessageContent } from "../value-objects/message-content.vo";

describe("MessageContent Value Object", () => {
  describe("create()", () => {
    it("should create valid content", () => {
      const result = MessageContent.create("Hello, world!" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("Hello, world!");
    });

    it("should create content with single character", () => {
      const result = MessageContent.create("a" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("a");
    });

    it("should create content with long text", () => {
      const longText = "a".repeat(10000);
      const result = MessageContent.create(longText);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(longText);
    });

    it("should create content with special characters", () => {
      const result = MessageContent.create("Hello! 👋 How are you?" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("Hello! 👋 How are you?");
    });

    it("should create content with newlines", () => {
      const result = MessageContent.create("Line 1\nLine 2\nLine 3" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should fail for empty content", () => {
      const result = MessageContent.create("" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Message content is required");
    });
  });

  describe("equals()", () => {
    it("should be equal for same content", () => {
      const content1 = MessageContent.create("Hello" as string).getValue();
      const content2 = MessageContent.create("Hello" as string).getValue();

      expect(content1.equals(content2)).toBe(true);
    });

    it("should not be equal for different content", () => {
      const content1 = MessageContent.create("Hello" as string).getValue();
      const content2 = MessageContent.create("World" as string).getValue();

      expect(content1.equals(content2)).toBe(false);
    });
  });
});
