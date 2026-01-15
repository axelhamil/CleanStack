import { describe, expect, it } from "vitest";
import { TokenCount } from "../value-objects/token-count.vo";

describe("TokenCount", () => {
  describe("valid values", () => {
    it("should create with positive integer", () => {
      const result = TokenCount.create(100 as number);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(100);
    });

    it("should create with zero", () => {
      const result = TokenCount.create(0 as number);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(0);
    });

    it("should create with large number", () => {
      const result = TokenCount.create(1000000 as number);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(1000000);
    });
  });

  describe("invalid values", () => {
    it("should fail for negative number", () => {
      const result = TokenCount.create(-1 as number);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("non-negative");
    });

    it("should fail for decimal number", () => {
      const result = TokenCount.create(10.5 as number);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("integer");
    });

    it("should fail for NaN", () => {
      const result = TokenCount.create(Number.NaN as number);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for Infinity", () => {
      const result = TokenCount.create(Number.POSITIVE_INFINITY as number);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("equality", () => {
    it("should be equal for same count", () => {
      const count1 = TokenCount.create(100 as number).getValue();
      const count2 = TokenCount.create(100 as number).getValue();

      expect(count1.equals(count2)).toBe(true);
    });

    it("should not be equal for different counts", () => {
      const count1 = TokenCount.create(100 as number).getValue();
      const count2 = TokenCount.create(200 as number).getValue();

      expect(count1.equals(count2)).toBe(false);
    });
  });

  describe("helper methods", () => {
    it("should add two token counts", () => {
      const count1 = TokenCount.create(100 as number).getValue();
      const count2 = TokenCount.create(50 as number).getValue();

      const result = count1.add(count2);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(150);
    });

    it("should have zero factory method", () => {
      const result = TokenCount.zero();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(0);
    });
  });
});
