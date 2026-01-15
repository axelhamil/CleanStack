import { BaseDomainEvent } from "@packages/ddd-kit";

interface SubscriptionCreatedPayload {
  subscriptionId: string;
  userId: string;
  planId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

export class SubscriptionCreatedEvent extends BaseDomainEvent<SubscriptionCreatedPayload> {
  readonly eventType = "subscription.created";
  readonly aggregateId: string;
  readonly payload: SubscriptionCreatedPayload;

  constructor(
    subscriptionId: string,
    userId: string,
    planId: string,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
  ) {
    super();
    this.aggregateId = subscriptionId;
    this.payload = {
      subscriptionId,
      userId,
      planId,
      stripeCustomerId,
      stripeSubscriptionId,
    };
  }
}
