import { describe, expect, it } from "vitest";
import {
  TokenUsage,
  type TokenUsageValue,
} from "../value-objects/token-usage.vo";

describe("TokenUsage Value Object", () => {
  describe("create()", () => {
    it("should create valid token usage", () => {
      const result = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toEqual({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      });
    });

    it("should create token usage with zero values", () => {
      const result = TokenUsage.create({
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      } as TokenUsageValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().inputTokens).toBe(0);
      expect(result.getValue().outputTokens).toBe(0);
      expect(result.getValue().totalTokens).toBe(0);
    });

    it("should create token usage with large values", () => {
      const result = TokenUsage.create({
        inputTokens: 100000,
        outputTokens: 50000,
        totalTokens: 150000,
      } as TokenUsageValue);

      expect(result.isSuccess).toBe(true);
    });

    it("should fail for negative inputTokens", () => {
      const result = TokenUsage.create({
        inputTokens: -1,
        outputTokens: 50,
        totalTokens: 49,
      } as TokenUsageValue);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Input tokens must be non-negative");
    });

    it("should fail for negative outputTokens", () => {
      const result = TokenUsage.create({
        inputTokens: 100,
        outputTokens: -1,
        totalTokens: 99,
      } as TokenUsageValue);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Output tokens must be non-negative");
    });

    it("should fail for negative totalTokens", () => {
      const result = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: -1,
      } as TokenUsageValue);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Total tokens must be non-negative");
    });

    it("should fail for non-integer values", () => {
      const result = TokenUsage.create({
        inputTokens: 100.5,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("getters", () => {
    it("should return correct inputTokens", () => {
      const usage = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();

      expect(usage.inputTokens).toBe(100);
    });

    it("should return correct outputTokens", () => {
      const usage = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();

      expect(usage.outputTokens).toBe(50);
    });

    it("should return correct totalTokens", () => {
      const usage = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();

      expect(usage.totalTokens).toBe(150);
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const usage1 = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();
      const usage2 = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();

      expect(usage1.equals(usage2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const usage1 = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();
      const usage2 = TokenUsage.create({
        inputTokens: 200,
        outputTokens: 50,
        totalTokens: 250,
      } as TokenUsageValue).getValue();

      expect(usage1.equals(usage2)).toBe(false);
    });
  });
});
