# FTR-004: Billing Domain

## Story

**As a** developer
**I want** a Billing domain
**So that** I can handle subscriptions cleanly

## Acceptance Criteria

- [ ] Subscription aggregate
- [ ] SubscriptionStatus VO
- [ ] PlanId VO
- [ ] Billing events
- [ ] Subscription repository interface

## Domain Model

### Subscription Aggregate

```typescript
// src/domain/billing/subscription.aggregate.ts
interface ISubscriptionProps {
  userId: UserId;
  planId: PlanId;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export class Subscription extends Aggregate<ISubscriptionProps> {
  static create(props: CreateProps): Subscription;
  cancel(reason: string): void;
  markPastDue(): void;
  renew(newPeriodEnd: Date): void;
  changePlan(newPlanId: PlanId): void;
}
```

### Value Objects

```typescript
// src/domain/billing/value-objects/subscription-status.vo.ts
type Status = 'active' | 'cancelled' | 'past_due' | 'trialing';

export class SubscriptionStatus extends ValueObject<Status> {
  protected validate(value: string): Result<Status> {
    const validStatuses = ['active', 'cancelled', 'past_due', 'trialing'];
    if (!validStatuses.includes(value)) {
      return Result.fail('Invalid subscription status');
    }
    return Result.ok(value as Status);
  }

  get isActive(): boolean { return this.value === 'active'; }
  get isCancelled(): boolean { return this.value === 'cancelled'; }
}

// src/domain/billing/value-objects/plan-id.vo.ts
export class PlanId extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    if (!value || value.length < 1) {
      return Result.fail('Plan ID cannot be empty');
    }
    return Result.ok(value);
  }
}
```

### Events

```typescript
// src/domain/billing/events/
- SubscriptionCreatedEvent
- SubscriptionCancelledEvent
- SubscriptionRenewedEvent
- PaymentFailedEvent
- PlanChangedEvent
```

### Repository Interface

```typescript
// src/application/ports/i-subscription-repository.port.ts
export interface ISubscriptionRepository extends BaseRepository<Subscription> {
  findByUserId(userId: string): Promise<Result<Option<Subscription>>>;
  findByStripeSubscriptionId(id: string): Promise<Result<Option<Subscription>>>;
  findByStripeCustomerId(id: string): Promise<Result<Option<Subscription>>>;
}
```

## Definition of Done

- [ ] Aggregate implemented
- [ ] VOs implemented
- [ ] Events implemented
- [ ] Repository interface defined
- [ ] Tests written
