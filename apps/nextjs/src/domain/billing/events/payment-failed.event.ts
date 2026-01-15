import { BaseDomainEvent } from "@packages/ddd-kit";

interface PaymentFailedPayload {
  subscriptionId: string;
  userId: string;
  stripeCustomerId: string;
  failedAt: Date;
}

export class PaymentFailedEvent extends BaseDomainEvent<PaymentFailedPayload> {
  readonly eventType = "subscription.payment_failed";
  readonly aggregateId: string;
  readonly payload: PaymentFailedPayload;

  constructor(
    subscriptionId: string,
    userId: string,
    stripeCustomerId: string,
    failedAt: Date,
  ) {
    super();
    this.aggregateId = subscriptionId;
    this.payload = {
      subscriptionId,
      userId,
      stripeCustomerId,
      failedAt,
    };
  }
}
