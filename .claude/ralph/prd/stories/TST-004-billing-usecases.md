# TST-004: Billing Use Cases Tests

## Story

**As a** developer
**I want** comprehensive tests for billing use cases
**So that** payment flows are reliable

## Acceptance Criteria

- [ ] Test CreateCheckoutSessionUseCase
- [ ] Test HandleWebhookUseCase
- [ ] Test CancelSubscriptionUseCase
- [ ] Test GetSubscriptionUseCase
- [ ] Coverage > 90%

## Test Cases

### CreateCheckoutSessionUseCase

```typescript
describe('CreateCheckoutSessionUseCase', () => {
  let useCase: CreateCheckoutSessionUseCase;
  let mockPaymentProvider: IPaymentProvider;
  let mockUserRepo: IUserRepository;

  beforeEach(() => {
    mockPaymentProvider = {
      createCheckoutSession: vi.fn(),
    };
    mockUserRepo = {
      findById: vi.fn(),
    };
    useCase = new CreateCheckoutSessionUseCase(mockPaymentProvider, mockUserRepo);
  });

  describe('happy path', () => {
    it('should create checkout session for valid user', async () => {
      mockUserRepo.findById.mockResolvedValue(Result.ok(Option.some(mockUser)));
      mockPaymentProvider.createCheckoutSession.mockResolvedValue(
        Result.ok({ sessionId: 'cs_123', url: 'https://checkout.stripe.com/...' })
      );

      const result = await useCase.execute({
        userId: 'user-123',
        priceId: 'price_pro',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().url).toContain('stripe.com');
    });
  });

  describe('error cases', () => {
    it('should fail when user not found', async () => {
      mockUserRepo.findById.mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('User not found');
    });

    it('should fail when payment provider errors', async () => {
      mockUserRepo.findById.mockResolvedValue(Result.ok(Option.some(mockUser)));
      mockPaymentProvider.createCheckoutSession.mockResolvedValue(
        Result.fail('Stripe error')
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
    });
  });
});
```

### HandleWebhookUseCase

```typescript
describe('HandleWebhookUseCase', () => {
  describe('checkout.session.completed', () => {
    it('should create subscription', async () => {
      mockPaymentProvider.verifyWebhook.mockResolvedValue(
        Result.ok({
          type: 'checkout.session.completed',
          data: { customerId: 'cus_123', subscriptionId: 'sub_123' },
        })
      );

      const result = await useCase.execute({ payload: '...', signature: '...' });

      expect(result.isSuccess).toBe(true);
      expect(mockSubscriptionRepo.create).toHaveBeenCalled();
    });
  });

  describe('invoice.payment_failed', () => {
    it('should mark subscription as past_due', async () => {
      mockPaymentProvider.verifyWebhook.mockResolvedValue(
        Result.ok({
          type: 'invoice.payment_failed',
          data: { subscriptionId: 'sub_123' },
        })
      );
      mockSubscriptionRepo.findByStripeId.mockResolvedValue(
        Result.ok(Option.some(mockSubscription))
      );

      const result = await useCase.execute({ payload: '...', signature: '...' });

      expect(result.isSuccess).toBe(true);
      expect(mockSubscription.markPastDue).toHaveBeenCalled();
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should cancel subscription', async () => {
      mockPaymentProvider.verifyWebhook.mockResolvedValue(
        Result.ok({
          type: 'customer.subscription.deleted',
          data: { subscriptionId: 'sub_123' },
        })
      );
      mockSubscriptionRepo.findByStripeId.mockResolvedValue(
        Result.ok(Option.some(mockSubscription))
      );

      await useCase.execute({ payload: '...', signature: '...' });

      expect(mockSubscription.cancel).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should fail when signature invalid', async () => {
      mockPaymentProvider.verifyWebhook.mockResolvedValue(
        Result.fail('Invalid signature')
      );

      const result = await useCase.execute({ payload: '...', signature: 'bad' });

      expect(result.isFailure).toBe(true);
    });
  });
});
```

### CancelSubscriptionUseCase

```typescript
describe('CancelSubscriptionUseCase', () => {
  it('should cancel subscription and notify payment provider', async () => {
    mockSubscriptionRepo.findById.mockResolvedValue(Result.ok(Option.some(mockSubscription)));
    mockPaymentProvider.cancelSubscription.mockResolvedValue(Result.ok(undefined));
    mockSubscriptionRepo.update.mockResolvedValue(Result.ok(mockSubscription));

    const result = await useCase.execute({ subscriptionId: 'sub-123', reason: 'User request' });

    expect(result.isSuccess).toBe(true);
    expect(mockPaymentProvider.cancelSubscription).toHaveBeenCalled();
    expect(mockDispatcher.dispatchAll).toHaveBeenCalled();
  });

  it('should fail when subscription not found', async () => {
    mockSubscriptionRepo.findById.mockResolvedValue(Result.ok(Option.none()));

    const result = await useCase.execute({ subscriptionId: 'not-found', reason: '' });

    expect(result.isFailure).toBe(true);
  });
});
```

## Definition of Done

- [ ] All tests pass
- [ ] Coverage > 90%
- [ ] Webhook events covered
