import { BaseDomainEvent } from "@packages/ddd-kit";

interface IBudgetThresholdReachedEventPayload {
  userId: string;
  currentSpend: number;
  budgetLimit: number;
  thresholdPercentage: number;
  currency: string;
  period: string;
}

export class BudgetThresholdReachedEvent extends BaseDomainEvent<IBudgetThresholdReachedEventPayload> {
  readonly eventType = "llm-usage.budget-threshold-reached";
  readonly aggregateId: string;
  readonly payload: IBudgetThresholdReachedEventPayload;

  constructor(data: {
    userId: string;
    currentSpend: number;
    budgetLimit: number;
    thresholdPercentage: number;
    currency: string;
    period: string;
  }) {
    super();
    this.aggregateId = data.userId;
    this.payload = {
      userId: data.userId,
      currentSpend: data.currentSpend,
      budgetLimit: data.budgetLimit,
      thresholdPercentage: data.thresholdPercentage,
      currency: data.currency,
      period: data.period,
    };
  }
}
