import { describe, expect, it } from "vitest";
import { PromptDescription } from "../value-objects/prompt-description.vo";

describe("PromptDescription Value Object", () => {
  describe("create()", () => {
    it("should create valid prompt description", () => {
      const result = PromptDescription.create(
        "A template for welcome emails" as string,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("A template for welcome emails");
    });

    it("should create description with empty string", () => {
      const result = PromptDescription.create("" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("");
    });

    it("should trim whitespace from description", () => {
      const result = PromptDescription.create(
        "  A description with spaces  " as string,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("A description with spaces");
    });

    it("should allow multiline descriptions", () => {
      const description = "Line 1\nLine 2\nLine 3";
      const result = PromptDescription.create(description as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(description);
    });

    it("should fail for description longer than 1000 characters", () => {
      const longDescription = "a".repeat(1001);
      const result = PromptDescription.create(longDescription as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("1000");
    });

    it("should accept description with exactly 1000 characters", () => {
      const maxDescription = "a".repeat(1000);
      const result = PromptDescription.create(maxDescription as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should allow special characters", () => {
      const result = PromptDescription.create(
        "Description with symbols: @#$%^&*()!" as string,
      );

      expect(result.isSuccess).toBe(true);
    });

    it("should allow unicode characters", () => {
      const result = PromptDescription.create(
        "Description with unicode: cafe" as string,
      );

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const desc1 = PromptDescription.create(
        "Welcome template" as string,
      ).getValue();
      const desc2 = PromptDescription.create(
        "Welcome template" as string,
      ).getValue();

      expect(desc1.equals(desc2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const desc1 = PromptDescription.create(
        "Welcome template" as string,
      ).getValue();
      const desc2 = PromptDescription.create(
        "Goodbye template" as string,
      ).getValue();

      expect(desc1.equals(desc2)).toBe(false);
    });

    it("should be equal after trimming", () => {
      const desc1 = PromptDescription.create(
        "  Welcome template  " as string,
      ).getValue();
      const desc2 = PromptDescription.create(
        "Welcome template" as string,
      ).getValue();

      expect(desc1.equals(desc2)).toBe(true);
    });
  });
});
