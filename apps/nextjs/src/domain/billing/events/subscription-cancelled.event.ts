import { BaseDomainEvent } from "@packages/ddd-kit";

interface SubscriptionCancelledPayload {
  subscriptionId: string;
  userId: string;
  reason: string;
  cancelledAt: Date;
}

export class SubscriptionCancelledEvent extends BaseDomainEvent<SubscriptionCancelledPayload> {
  readonly eventType = "subscription.cancelled";
  readonly aggregateId: string;
  readonly payload: SubscriptionCancelledPayload;

  constructor(
    subscriptionId: string,
    userId: string,
    reason: string,
    cancelledAt: Date,
  ) {
    super();
    this.aggregateId = subscriptionId;
    this.payload = {
      subscriptionId,
      userId,
      reason,
      cancelledAt,
    };
  }
}
