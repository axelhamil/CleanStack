import { describe, expect, it } from "vitest";
import { Cost, type CostValue } from "../value-objects/cost.vo";

describe("Cost Value Object", () => {
  describe("create()", () => {
    it("should create valid cost", () => {
      const result = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toEqual({
        amount: 0.05,
        currency: "USD",
      });
    });

    it("should create cost with zero amount", () => {
      const result = Cost.create({
        amount: 0,
        currency: "USD",
      } as CostValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
    });

    it("should create cost with different currencies", () => {
      const result = Cost.create({
        amount: 10,
        currency: "EUR",
      } as CostValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().currency).toBe("EUR");
    });

    it("should fail for negative amount", () => {
      const result = Cost.create({
        amount: -1,
        currency: "USD",
      } as CostValue);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Cost amount must be non-negative");
    });

    it("should fail for empty currency", () => {
      const result = Cost.create({
        amount: 10,
        currency: "",
      } as CostValue);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for currency longer than 3 characters", () => {
      const result = Cost.create({
        amount: 10,
        currency: "USDT",
      } as CostValue);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("getters", () => {
    it("should return correct amount", () => {
      const cost = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();

      expect(cost.amount).toBe(0.05);
    });

    it("should return correct currency", () => {
      const cost = Cost.create({
        amount: 0.05,
        currency: "EUR",
      } as CostValue).getValue();

      expect(cost.currency).toBe("EUR");
    });
  });

  describe("zero()", () => {
    it("should create zero cost with default USD", () => {
      const result = Cost.zero();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
      expect(result.getValue().currency).toBe("USD");
    });

    it("should create zero cost with specified currency", () => {
      const result = Cost.zero("EUR");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().amount).toBe(0);
      expect(result.getValue().currency).toBe("EUR");
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const cost1 = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();
      const cost2 = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();

      expect(cost1.equals(cost2)).toBe(true);
    });

    it("should not be equal for different amounts", () => {
      const cost1 = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();
      const cost2 = Cost.create({
        amount: 0.1,
        currency: "USD",
      } as CostValue).getValue();

      expect(cost1.equals(cost2)).toBe(false);
    });

    it("should not be equal for different currencies", () => {
      const cost1 = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();
      const cost2 = Cost.create({
        amount: 0.05,
        currency: "EUR",
      } as CostValue).getValue();

      expect(cost1.equals(cost2)).toBe(false);
    });
  });
});
