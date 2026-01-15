# FTR-005: Stripe Payment Provider

## Story

**As a** developer
**I want** a Stripe payment provider
**So that** I can process payments through a clean interface

## Acceptance Criteria

- [ ] IPaymentProvider interface defined
- [ ] StripePaymentProvider implemented
- [ ] Checkout session creation
- [ ] Webhook verification
- [ ] Subscription management
- [ ] Customer portal URL

## Technical Notes

### Interface

```typescript
// src/application/ports/i-payment-provider.port.ts
export interface IPaymentProvider {
  createCheckoutSession(params: CreateCheckoutParams): Promise<Result<CheckoutSession>>;
  createCustomerPortalSession(customerId: string): Promise<Result<PortalSession>>;
  cancelSubscription(subscriptionId: string): Promise<Result<void>>;
  verifyWebhook(payload: string, signature: string): Promise<Result<WebhookEvent>>;
  getSubscription(subscriptionId: string): Promise<Result<StripeSubscription>>;
}

interface CreateCheckoutParams {
  customerId?: string;
  customerEmail?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

interface CheckoutSession {
  sessionId: string;
  url: string;
}

interface WebhookEvent {
  type: string;
  data: unknown;
}
```

### Implementation

```typescript
// src/adapters/payment/stripe-payment.provider.ts
import Stripe from 'stripe';

export class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(params: CreateCheckoutParams): Promise<Result<CheckoutSession>> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: params.customerId,
        customer_email: params.customerId ? undefined : params.customerEmail,
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
      });

      return Result.ok({ sessionId: session.id, url: session.url! });
    } catch (error) {
      return Result.fail(`Stripe error: ${error.message}`);
    }
  }

  async verifyWebhook(payload: string, signature: string): Promise<Result<WebhookEvent>> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      return Result.ok({ type: event.type, data: event.data.object });
    } catch (error) {
      return Result.fail('Invalid webhook signature');
    }
  }

  // ... other methods
}
```

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
```

## Definition of Done

- [ ] Interface defined
- [ ] Provider implemented
- [ ] Registered in DI
- [ ] Tests with mocked Stripe
