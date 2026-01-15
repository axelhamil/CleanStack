import { describe, expect, it } from "vitest";
import { ModelIdentifier } from "../value-objects/model-identifier.vo";

describe("ModelIdentifier", () => {
  describe("valid models", () => {
    it("should create with OpenAI model", () => {
      const result = ModelIdentifier.create("gpt-4o" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("gpt-4o");
    });

    it("should create with Anthropic model", () => {
      const result = ModelIdentifier.create(
        "claude-sonnet-4-20250514" as string,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("claude-sonnet-4-20250514");
    });

    it("should create with Google model", () => {
      const result = ModelIdentifier.create("gemini-pro" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("gemini-pro");
    });

    it("should create with complex model name", () => {
      const result = ModelIdentifier.create("gpt-4-turbo-2024-04-09" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("gpt-4-turbo-2024-04-09");
    });
  });

  describe("invalid models", () => {
    it("should fail for empty string", () => {
      const result = ModelIdentifier.create("" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Model identifier");
    });

    it("should fail for whitespace-only string", () => {
      const result = ModelIdentifier.create("   " as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for excessively long model name", () => {
      const longName = "a".repeat(201);
      const result = ModelIdentifier.create(longName as string);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("trimming", () => {
    it("should trim leading and trailing whitespace", () => {
      const result = ModelIdentifier.create("  gpt-4o  " as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("gpt-4o");
    });
  });

  describe("equality", () => {
    it("should be equal for same model", () => {
      const model1 = ModelIdentifier.create("gpt-4o" as string).getValue();
      const model2 = ModelIdentifier.create("gpt-4o" as string).getValue();

      expect(model1.equals(model2)).toBe(true);
    });

    it("should not be equal for different models", () => {
      const model1 = ModelIdentifier.create("gpt-4o" as string).getValue();
      const model2 = ModelIdentifier.create(
        "claude-sonnet-4-20250514" as string,
      ).getValue();

      expect(model1.equals(model2)).toBe(false);
    });
  });
});
