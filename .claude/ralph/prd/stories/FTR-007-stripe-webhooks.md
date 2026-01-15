# FTR-007: Stripe Webhooks

## Story

**As a** developer
**I want** to handle Stripe webhooks
**So that** subscription state stays in sync

## Acceptance Criteria

- [ ] Webhook endpoint created
- [ ] Signature verification
- [ ] Handle checkout.session.completed
- [ ] Handle invoice.payment_failed
- [ ] Handle customer.subscription.deleted
- [ ] Handle customer.subscription.updated
- [ ] Events dispatched after processing

## Technical Notes

### Webhook Endpoint

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  const useCase = getInjection('HandleStripeWebhookUseCase');
  const result = await useCase.execute({ payload: body, signature });

  if (result.isFailure) {
    console.error('Webhook error:', result.getError());
    return Response.json({ error: result.getError() }, { status: 400 });
  }

  return Response.json({ received: true });
}
```

### Use Case

```typescript
// src/application/use-cases/billing/handle-stripe-webhook.use-case.ts
export class HandleStripeWebhookUseCase implements UseCase<Input, void> {
  constructor(
    private readonly paymentProvider: IPaymentProvider,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly userRepo: IUserRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: Input): Promise<Result<void>> {
    // 1. Verify webhook
    const eventResult = await this.paymentProvider.verifyWebhook(
      input.payload,
      input.signature
    );
    if (eventResult.isFailure) return Result.fail(eventResult.getError());

    const event = eventResult.getValue();

    // 2. Handle event type
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutCompleted(event.data);

      case 'invoice.payment_failed':
        return this.handlePaymentFailed(event.data);

      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event.data);

      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data);

      default:
        return Result.ok(undefined); // Ignore unknown events
    }
  }

  private async handleCheckoutCompleted(data: CheckoutSession): Promise<Result<void>> {
    const userId = data.metadata.userId;
    const customerId = data.customer;
    const subscriptionId = data.subscription;

    // Create subscription
    const subscription = Subscription.create({
      userId: UserId.create(new UUID(userId)),
      planId: PlanId.create(data.metadata.priceId || 'pro').getValue(),
      status: SubscriptionStatus.create('active').getValue(),
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const saveResult = await this.subscriptionRepo.create(subscription);
    if (saveResult.isFailure) return Result.fail(saveResult.getError());

    await this.eventDispatcher.dispatchAll(subscription.domainEvents);
    subscription.clearEvents();

    return Result.ok(undefined);
  }

  private async handlePaymentFailed(data: Invoice): Promise<Result<void>> {
    const subResult = await this.subscriptionRepo.findByStripeSubscriptionId(
      data.subscription
    );
    if (subResult.isFailure) return Result.fail(subResult.getError());

    const subOption = subResult.getValue();
    if (subOption.isNone()) return Result.ok(undefined);

    const subscription = subOption.unwrap();
    subscription.markPastDue();

    await this.subscriptionRepo.update(subscription);
    await this.eventDispatcher.dispatchAll(subscription.domainEvents);
    subscription.clearEvents();

    return Result.ok(undefined);
  }

  // ... other handlers
}
```

### Stripe CLI for Local Testing

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Definition of Done

- [ ] Endpoint created
- [ ] All event types handled
- [ ] Local testing works
- [ ] Tests with mocked webhooks
