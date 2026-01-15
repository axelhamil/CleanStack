import { BaseDomainEvent } from "@packages/ddd-kit";

interface IBudgetExceededEventPayload {
  userId: string;
  currentSpend: number;
  budgetLimit: number;
  excessAmount: number;
  currency: string;
  period: string;
}

export class BudgetExceededEvent extends BaseDomainEvent<IBudgetExceededEventPayload> {
  readonly eventType = "llm-usage.budget-exceeded";
  readonly aggregateId: string;
  readonly payload: IBudgetExceededEventPayload;

  constructor(data: {
    userId: string;
    currentSpend: number;
    budgetLimit: number;
    excessAmount: number;
    currency: string;
    period: string;
  }) {
    super();
    this.aggregateId = data.userId;
    this.payload = {
      userId: data.userId,
      currentSpend: data.currentSpend,
      budgetLimit: data.budgetLimit,
      excessAmount: data.excessAmount,
      currency: data.currency,
      period: data.period,
    };
  }
}
