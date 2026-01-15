# TST-002: Billing Domain Tests

## Story

**As a** developer
**I want** comprehensive tests for Billing domain
**So that** subscription handling is reliable

## Acceptance Criteria

- [ ] Test Subscription aggregate
- [ ] Test billing value objects (PlanId, SubscriptionStatus)
- [ ] Test subscription events
- [ ] Test subscription state transitions
- [ ] Coverage > 90%

## Test Cases

### Subscription Aggregate

```typescript
describe('Subscription Aggregate', () => {
  const userId = new UserId(new UUID());
  const planId = PlanId.create('pro').getValue();

  describe('create', () => {
    it('should create subscription with active status', () => {
      const subscription = Subscription.create({
        userId,
        planId,
        customerId: 'cus_123',
      });

      expect(subscription.status.value).toBe('active');
      expect(subscription.startDate).toBeInstanceOf(Date);
    });

    it('should emit SubscriptionCreatedEvent', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });

      expect(subscription.domainEvents).toHaveLength(1);
      expect(subscription.domainEvents[0]).toBeInstanceOf(SubscriptionCreatedEvent);
    });
  });

  describe('cancel', () => {
    it('should change status to cancelled', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });

      subscription.cancel('User requested');

      expect(subscription.status.value).toBe('cancelled');
      expect(subscription.cancelledAt).toBeInstanceOf(Date);
    });

    it('should emit SubscriptionCancelledEvent', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });
      subscription.clearEvents();

      subscription.cancel('User requested');

      expect(subscription.domainEvents[0]).toBeInstanceOf(SubscriptionCancelledEvent);
    });

    it('should not cancel already cancelled subscription', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });
      subscription.cancel('First cancel');
      subscription.clearEvents();

      subscription.cancel('Second cancel');

      expect(subscription.domainEvents).toHaveLength(0);
    });
  });

  describe('markPastDue', () => {
    it('should change status to past_due', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });

      subscription.markPastDue();

      expect(subscription.status.value).toBe('past_due');
    });

    it('should emit PaymentFailedEvent', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });
      subscription.clearEvents();

      subscription.markPastDue();

      expect(subscription.domainEvents[0]).toBeInstanceOf(PaymentFailedEvent);
    });
  });

  describe('renew', () => {
    it('should update period end date', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });
      const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      subscription.renew(newEndDate);

      expect(subscription.currentPeriodEnd).toEqual(newEndDate);
    });

    it('should restore active status if past_due', () => {
      const subscription = Subscription.create({ userId, planId, customerId: 'cus_123' });
      subscription.markPastDue();
      subscription.clearEvents();

      subscription.renew(new Date());

      expect(subscription.status.value).toBe('active');
    });
  });
});
```

### SubscriptionStatus Value Object

```typescript
describe('SubscriptionStatus', () => {
  it.each(['active', 'cancelled', 'past_due', 'trialing'])(
    'should accept valid status: %s',
    (status) => {
      const result = SubscriptionStatus.create(status);
      expect(result.isSuccess).toBe(true);
    }
  );

  it('should reject invalid status', () => {
    const result = SubscriptionStatus.create('invalid');
    expect(result.isFailure).toBe(true);
  });
});
```

## Definition of Done

- [ ] All tests pass
- [ ] Coverage > 90%
- [ ] State transitions tested
