import { describe, expect, it } from "vitest";
import { BudgetExceededEvent } from "../events/budget-exceeded.event";
import { BudgetThresholdReachedEvent } from "../events/budget-threshold-reached.event";

describe("BudgetExceededEvent", () => {
  const createEventData = () => ({
    userId: "user-123",
    currentSpend: 150.5,
    budgetLimit: 100.0,
    excessAmount: 50.5,
    currency: "USD",
    period: "monthly",
  });

  describe("constructor", () => {
    it("should create event with correct eventType", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.eventType).toBe("llm-usage.budget-exceeded");
    });

    it("should set aggregateId to userId", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.aggregateId).toBe("user-123");
    });

    it("should set payload with all required fields", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload).toEqual({
        userId: "user-123",
        currentSpend: 150.5,
        budgetLimit: 100.0,
        excessAmount: 50.5,
        currency: "USD",
        period: "monthly",
      });
    });

    it("should contain userId in payload", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload.userId).toBe("user-123");
    });

    it("should contain currentSpend in payload", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload.currentSpend).toBe(150.5);
    });

    it("should contain budgetLimit in payload", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload.budgetLimit).toBe(100.0);
    });

    it("should contain excessAmount in payload", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload.excessAmount).toBe(50.5);
    });

    it("should contain currency in payload", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload.currency).toBe("USD");
    });

    it("should contain period in payload", () => {
      const data = createEventData();

      const event = new BudgetExceededEvent(data);

      expect(event.payload.period).toBe("monthly");
    });
  });

  describe("with different periods", () => {
    it("should handle daily period", () => {
      const event = new BudgetExceededEvent({
        ...createEventData(),
        period: "daily",
      });

      expect(event.payload.period).toBe("daily");
    });

    it("should handle monthly period", () => {
      const event = new BudgetExceededEvent({
        ...createEventData(),
        period: "monthly",
      });

      expect(event.payload.period).toBe("monthly");
    });
  });

  describe("with different currencies", () => {
    it("should handle EUR currency", () => {
      const event = new BudgetExceededEvent({
        ...createEventData(),
        currency: "EUR",
      });

      expect(event.payload.currency).toBe("EUR");
    });
  });
});

describe("BudgetThresholdReachedEvent", () => {
  const createEventData = () => ({
    userId: "user-456",
    currentSpend: 80.0,
    budgetLimit: 100.0,
    thresholdPercentage: 80,
    currency: "USD",
    period: "monthly",
  });

  describe("constructor", () => {
    it("should create event with correct eventType", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.eventType).toBe("llm-usage.budget-threshold-reached");
    });

    it("should set aggregateId to userId", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.aggregateId).toBe("user-456");
    });

    it("should set payload with all required fields", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload).toEqual({
        userId: "user-456",
        currentSpend: 80.0,
        budgetLimit: 100.0,
        thresholdPercentage: 80,
        currency: "USD",
        period: "monthly",
      });
    });

    it("should contain userId in payload", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload.userId).toBe("user-456");
    });

    it("should contain currentSpend in payload", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload.currentSpend).toBe(80.0);
    });

    it("should contain budgetLimit in payload", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload.budgetLimit).toBe(100.0);
    });

    it("should contain thresholdPercentage in payload", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload.thresholdPercentage).toBe(80);
    });

    it("should contain currency in payload", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload.currency).toBe("USD");
    });

    it("should contain period in payload", () => {
      const data = createEventData();

      const event = new BudgetThresholdReachedEvent(data);

      expect(event.payload.period).toBe("monthly");
    });
  });

  describe("with different threshold percentages", () => {
    it("should handle 70% threshold", () => {
      const event = new BudgetThresholdReachedEvent({
        ...createEventData(),
        thresholdPercentage: 70,
        currentSpend: 70.0,
      });

      expect(event.payload.thresholdPercentage).toBe(70);
      expect(event.payload.currentSpend).toBe(70.0);
    });

    it("should handle 90% threshold", () => {
      const event = new BudgetThresholdReachedEvent({
        ...createEventData(),
        thresholdPercentage: 90,
        currentSpend: 90.0,
      });

      expect(event.payload.thresholdPercentage).toBe(90);
      expect(event.payload.currentSpend).toBe(90.0);
    });
  });

  describe("with different periods", () => {
    it("should handle daily period", () => {
      const event = new BudgetThresholdReachedEvent({
        ...createEventData(),
        period: "daily",
      });

      expect(event.payload.period).toBe("daily");
    });
  });
});
