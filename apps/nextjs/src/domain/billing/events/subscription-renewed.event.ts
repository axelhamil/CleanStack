import { BaseDomainEvent } from "@packages/ddd-kit";

interface SubscriptionRenewedPayload {
  subscriptionId: string;
  userId: string;
  planId: string;
  newPeriodStart: Date;
  newPeriodEnd: Date;
}

export class SubscriptionRenewedEvent extends BaseDomainEvent<SubscriptionRenewedPayload> {
  readonly eventType = "subscription.renewed";
  readonly aggregateId: string;
  readonly payload: SubscriptionRenewedPayload;

  constructor(
    subscriptionId: string,
    userId: string,
    planId: string,
    newPeriodStart: Date,
    newPeriodEnd: Date,
  ) {
    super();
    this.aggregateId = subscriptionId;
    this.payload = {
      subscriptionId,
      userId,
      planId,
      newPeriodStart,
      newPeriodEnd,
    };
  }
}
