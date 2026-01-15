import { BaseDomainEvent } from "@packages/ddd-kit";

interface PlanChangedPayload {
  subscriptionId: string;
  userId: string;
  previousPlanId: string;
  newPlanId: string;
  changedAt: Date;
}

export class PlanChangedEvent extends BaseDomainEvent<PlanChangedPayload> {
  readonly eventType = "subscription.plan_changed";
  readonly aggregateId: string;
  readonly payload: PlanChangedPayload;

  constructor(
    subscriptionId: string,
    userId: string,
    previousPlanId: string,
    newPlanId: string,
    changedAt: Date,
  ) {
    super();
    this.aggregateId = subscriptionId;
    this.payload = {
      subscriptionId,
      userId,
      previousPlanId,
      newPlanId,
      changedAt,
    };
  }
}
