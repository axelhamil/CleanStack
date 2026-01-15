import { describe, expect, it } from "vitest";
import { PromptKey } from "../value-objects/prompt-key.vo";

describe("PromptKey Value Object", () => {
  describe("create()", () => {
    it("should create valid prompt key with lowercase letters", () => {
      const result = PromptKey.create("welcome" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("welcome");
    });

    it("should create valid prompt key with hyphens", () => {
      const result = PromptKey.create("welcome-email" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("welcome-email");
    });

    it("should create valid prompt key with numbers", () => {
      const result = PromptKey.create("email-v2" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("email-v2");
    });

    it("should create valid prompt key with multiple hyphens", () => {
      const result = PromptKey.create("product-description-template" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("product-description-template");
    });

    it("should fail for empty string", () => {
      const result = PromptKey.create("" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for uppercase letters", () => {
      const result = PromptKey.create("Welcome" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("lowercase");
    });

    it("should fail for spaces", () => {
      const result = PromptKey.create("welcome email" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for underscores", () => {
      const result = PromptKey.create("welcome_email" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for special characters", () => {
      const result = PromptKey.create("welcome@email" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for leading hyphen", () => {
      const result = PromptKey.create("-welcome" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for trailing hyphen", () => {
      const result = PromptKey.create("welcome-" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for consecutive hyphens", () => {
      const result = PromptKey.create("welcome--email" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for key longer than 100 characters", () => {
      const longKey = "a".repeat(101);
      const result = PromptKey.create(longKey as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("100");
    });

    it("should accept key with exactly 100 characters", () => {
      const maxKey = "a".repeat(100);
      const result = PromptKey.create(maxKey as string);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const key1 = PromptKey.create("welcome-email" as string).getValue();
      const key2 = PromptKey.create("welcome-email" as string).getValue();

      expect(key1.equals(key2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const key1 = PromptKey.create("welcome-email" as string).getValue();
      const key2 = PromptKey.create("goodbye-email" as string).getValue();

      expect(key1.equals(key2)).toBe(false);
    });
  });
});
