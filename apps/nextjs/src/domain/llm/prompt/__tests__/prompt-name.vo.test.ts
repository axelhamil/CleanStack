import { describe, expect, it } from "vitest";
import { PromptName } from "../value-objects/prompt-name.vo";

describe("PromptName Value Object", () => {
  describe("create()", () => {
    it("should create valid prompt name", () => {
      const result = PromptName.create("Welcome Email" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("Welcome Email");
    });

    it("should trim whitespace from name", () => {
      const result = PromptName.create("  Welcome Email  " as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("Welcome Email");
    });

    it("should fail for empty string", () => {
      const result = PromptName.create("" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for whitespace-only string", () => {
      const result = PromptName.create("   " as string);

      expect(result.isFailure).toBe(true);
    });

    it("should allow special characters", () => {
      const result = PromptName.create("Welcome Email (v2)" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("Welcome Email (v2)");
    });

    it("should fail for name longer than 200 characters", () => {
      const longName = "a".repeat(201);
      const result = PromptName.create(longName as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("200");
    });

    it("should accept name with exactly 200 characters", () => {
      const maxName = "a".repeat(200);
      const result = PromptName.create(maxName as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should accept single character name", () => {
      const result = PromptName.create("A" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("A");
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const name1 = PromptName.create("Welcome Email" as string).getValue();
      const name2 = PromptName.create("Welcome Email" as string).getValue();

      expect(name1.equals(name2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const name1 = PromptName.create("Welcome Email" as string).getValue();
      const name2 = PromptName.create("Goodbye Email" as string).getValue();

      expect(name1.equals(name2)).toBe(false);
    });

    it("should be equal after trimming", () => {
      const name1 = PromptName.create("  Welcome Email  " as string).getValue();
      const name2 = PromptName.create("Welcome Email" as string).getValue();

      expect(name1.equals(name2)).toBe(true);
    });
  });
});
