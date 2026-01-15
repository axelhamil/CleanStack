import type { Result } from "@packages/ddd-kit";

export interface CreateCheckoutParams {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PortalSession {
  sessionId: string;
  url: string;
}

export interface WebhookEvent {
  type: string;
  data: unknown;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  status: string;
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
}

export interface IPaymentProvider {
  createCheckoutSession(
    params: CreateCheckoutParams,
  ): Promise<Result<CheckoutSession>>;

  createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Result<PortalSession>>;

  cancelSubscription(subscriptionId: string): Promise<Result<void>>;

  verifyWebhook(
    payload: string,
    signature: string,
  ): Promise<Result<WebhookEvent>>;

  getSubscription(subscriptionId: string): Promise<Result<StripeSubscription>>;
}
