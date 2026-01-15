---
name: feature-prd
description: Generate a Product Requirements Document from EventStorming output
---

# Feature PRD Generator

You generate structured PRDs for features based on EventStorming discoveries or feature descriptions. Your output should be actionable for implementation using this project's Clean Architecture patterns.

## Input

Expects one of:
1. EventStorming YAML output from `/eventstorming`
2. A description of the feature to build

If given a description, first extract the domain concepts before generating the PRD.

## Output Structure

Generate a PRD with these sections:

### 1. Overview

```markdown
## Overview

**Feature:** [Feature Name]
**Business Value:** [Why this feature matters]
**Success Metrics:**
- [Measurable outcome 1]
- [Measurable outcome 2]
```

### 2. Domain Model

From EventStorming output or feature analysis:

```markdown
## Domain Model

### [AggregateName] Aggregate
Located at: `src/domain/[aggregate-name]/`

**Properties:**
- id: [AggregateName]Id (UUID)
- [property]: [Type or ValueObject]
- createdAt: Date
- updatedAt: Option<Date>

**Value Objects:**
- [VOName] - [validation rules]

**Domain Events:**
- [EventName] - triggered when [condition]
```

### 3. Use Cases

For each Command identified:

```markdown
## Use Cases

### [CommandName]UseCase
Located at: `src/application/use-cases/[feature]/[command-name].use-case.ts`

**Input DTO:**
```typescript
interface I[CommandName]InputDto {
  [field]: [type];
}
```

**Output DTO:**
```typescript
interface I[CommandName]OutputDto {
  [field]: [type];
}
```

**Business Rules:**
1. [Rule 1]
2. [Rule 2]

**Events Emitted:**
- [EventName] on success

**Error Cases:**
- [ErrorCase]: [ErrorMessage]
```

### 4. API Endpoints

```markdown
## API Endpoints

### [Action] [Resource]
- **Route:** `[METHOD] /api/[resource]`
- **Auth:** Required / Public
- **Request:**
```json
{ "field": "type" }
```
- **Response:**
```json
{ "field": "type" }
```
- **Errors:**
  - 400: Validation error
  - 401: Unauthorized
  - 404: Not found
```

### 5. Policies (Event Handlers)

```markdown
## Event Handlers

### On [EventName]
**Handler:** `[HandlerName]Handler`
**Action:** [What happens when event is triggered]
```

### 6. Implementation Checklist

```markdown
## Implementation Checklist

### Domain Layer
- [ ] Create `[Aggregate]Id` in `src/domain/[name]/[name].id.ts`
- [ ] Create `[Aggregate]` aggregate in `src/domain/[name]/[name].aggregate.ts`
- [ ] Create value objects in `src/domain/[name]/value-objects/`
- [ ] Create domain events in `src/domain/[name]/events/`

### Application Layer
- [ ] Create DTOs in `src/application/dto/[feature]/`
- [ ] Create `I[Aggregate]Repository` port in `src/application/ports/`
- [ ] Create use cases in `src/application/use-cases/[feature]/`

### Adapters Layer
- [ ] Create `[Aggregate]Mapper` in `src/adapters/mappers/`
- [ ] Create `Drizzle[Aggregate]Repository` in `src/adapters/repositories/`
- [ ] Create event handlers in `src/adapters/events/handlers/`
- [ ] Create server actions in `src/adapters/actions/[feature]/`

### Infrastructure
- [ ] Add DB schema in `packages/drizzle/schema/`
- [ ] Add DI bindings in `common/di/modules/`
- [ ] Add API routes if needed

### Tests
- [ ] Domain tests (aggregate, value objects)
- [ ] Use case tests
- [ ] E2E tests for critical paths
```

## Guidelines

1. **Follow existing patterns**: Reference `src/domain/user/` and `src/application/use-cases/auth/` for patterns
2. **Use Result<T>**: All operations that can fail return Result
3. **Use Option<T>**: Nullable values use Option
4. **Value Objects**: All business values should be Value Objects with validation
5. **Domain Events**: Emit events for significant state changes
6. **DTOs with Zod**: All DTOs use Zod schemas for validation

## Example Output

```markdown
# PRD: Subscription Management

## Overview

**Feature:** Subscription Management
**Business Value:** Enable recurring revenue through subscription plans
**Success Metrics:**
- User can subscribe to a plan within 30 seconds
- Subscription cancellation rate < 5%
- Payment success rate > 95%

## Domain Model

### Subscription Aggregate
Located at: `src/domain/subscription/`

**Properties:**
- id: SubscriptionId (UUID)
- userId: UserId
- planId: PlanId
- status: SubscriptionStatus
- currentPeriodStart: Date
- currentPeriodEnd: Date
- cancelAtPeriodEnd: boolean
- createdAt: Date
- updatedAt: Option<Date>

**Value Objects:**
- SubscriptionStatus - enum: active, cancelled, past_due, trialing
- PlanId - validated string identifier

**Domain Events:**
- SubscriptionCreatedEvent - triggered when user subscribes
- SubscriptionCancelledEvent - triggered when subscription cancelled
- SubscriptionRenewedEvent - triggered on successful renewal

## Use Cases

### CreateSubscriptionUseCase
Located at: `src/application/use-cases/subscription/create-subscription.use-case.ts`

**Input DTO:**
```typescript
interface ICreateSubscriptionInputDto {
  userId: string;
  planId: string;
  paymentMethodId: string;
}
```

**Output DTO:**
```typescript
interface ICreateSubscriptionOutputDto {
  subscriptionId: string;
  status: string;
  currentPeriodEnd: string;
}
```

**Business Rules:**
1. User must not have an active subscription
2. Plan must exist and be available
3. Payment method must be valid

**Events Emitted:**
- SubscriptionCreatedEvent on success

**Error Cases:**
- ALREADY_SUBSCRIBED: User already has active subscription
- PLAN_NOT_FOUND: Plan does not exist
- PAYMENT_FAILED: Payment method validation failed

## API Endpoints

### Create Subscription
- **Route:** `POST /api/subscriptions`
- **Auth:** Required
- **Request:**
```json
{
  "planId": "string",
  "paymentMethodId": "string"
}
```
- **Response:**
```json
{
  "subscriptionId": "string",
  "status": "active",
  "currentPeriodEnd": "2024-02-01T00:00:00Z"
}
```

## Event Handlers

### On SubscriptionCreatedEvent
**Handler:** SendSubscriptionConfirmationHandler
**Action:** Send confirmation email to user

### On SubscriptionCancelledEvent
**Handler:** ScheduleCancellationReminderHandler
**Action:** Schedule reminder email before period ends

## Implementation Checklist

### Domain Layer
- [ ] Create `SubscriptionId` in `src/domain/subscription/subscription.id.ts`
- [ ] Create `Subscription` aggregate in `src/domain/subscription/subscription.aggregate.ts`
- [ ] Create `SubscriptionStatus` VO in `src/domain/subscription/value-objects/`
- [ ] Create `PlanId` VO in `src/domain/subscription/value-objects/`
- [ ] Create events in `src/domain/subscription/events/`

### Application Layer
- [ ] Create DTOs in `src/application/dto/subscription/`
- [ ] Create `ISubscriptionRepository` port
- [ ] Create `IPaymentProvider` port
- [ ] Create `CreateSubscriptionUseCase`
- [ ] Create `CancelSubscriptionUseCase`

### Adapters Layer
- [ ] Create `SubscriptionMapper`
- [ ] Create `DrizzleSubscriptionRepository`
- [ ] Create Stripe payment provider adapter
- [ ] Create server actions

### Infrastructure
- [ ] Add `subscription` table to schema
- [ ] Add `plan` table to schema
- [ ] Add DI bindings

### Tests
- [ ] Subscription aggregate tests
- [ ] Value object tests
- [ ] CreateSubscription use case tests
- [ ] CancelSubscription use case tests
- [ ] E2E subscription flow test
```
