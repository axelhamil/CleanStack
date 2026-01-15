---
name: gen-domain
description: Generate domain layer code (Aggregate, Value Objects, Events) from PRD specification
---

# Domain Generator

Generate production-ready domain code following project conventions. Reference: `src/domain/user/`

## Input

PRD section describing domain model, or direct specification:
- Aggregate name and properties
- Value Objects needed
- Events to emit

## Output Files

Generate these files in `src/domain/{aggregate-kebab-case}/`:

### 1. Aggregate ID
`src/domain/{name}/{name}-id.ts`

```typescript
import { UUID } from "@packages/ddd-kit";

export class {Name}Id extends UUID<string | number> {
  protected [Symbol.toStringTag] = "{Name}Id";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): {Name}Id {
    return new {Name}Id(id);
  }
}
```

### 2. Aggregate
`src/domain/{name}/{name}.aggregate.ts`

```typescript
import { Aggregate, type Option, Result, UUID } from "@packages/ddd-kit";
import { {Name}CreatedEvent } from "./events/{name}-created.event";
import { {Name}Id } from "./{name}-id";
// import value objects...

export interface I{Name}Props {
  // Required properties with types
  createdAt?: Date;
  updatedAt?: Date;
}

export class {Name} extends Aggregate<I{Name}Props> {
  private constructor(props: I{Name}Props, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): {Name}Id {
    return {Name}Id.create(this._id);
  }

  static create(
    props: Omit<I{Name}Props, "createdAt" | "updatedAt">,
    id?: UUID<string | number>,
  ): {Name} {
    const newId = id ?? new UUID<string>();
    const entity = new {Name}(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      newId,
    );

    // Emit creation event only for new entities
    if (!id) {
      entity.addEvent(
        new {Name}CreatedEvent(
          entity.id.value.toString(),
          // pass relevant props...
        ),
      );
    }

    return entity;
  }

  static reconstitute(props: I{Name}Props, id: {Name}Id): {Name} {
    return new {Name}(props, id);
  }

  // Add domain methods that modify state and emit events
  // Example:
  // updateStatus(status: Status): Result<void> {
  //   if (this.get("status").equals(status)) {
  //     return Result.fail("Status is already set");
  //   }
  //   this._props.status = status;
  //   this._props.updatedAt = new Date();
  //   this.addEvent(new {Name}StatusChangedEvent(...));
  //   return Result.ok();
  // }
}
```

### 3. Value Objects
`src/domain/{name}/value-objects/{vo-kebab-case}.vo.ts`

```typescript
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const {voName}Schema = z
  .string()
  .min(1, "{VoName} is required")
  .max(100, "{VoName} must be less than 100 characters");

export class {VoName} extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = {voName}Schema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid {voName}");
    }

    return Result.ok(result.data);
  }
}
```

**Enum Value Object (for status-like values):**

```typescript
import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const {Name}StatusEnum = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
} as const;

export type {Name}StatusType = (typeof {Name}StatusEnum)[keyof typeof {Name}StatusEnum];

const statusSchema = z.enum([
  {Name}StatusEnum.ACTIVE,
  {Name}StatusEnum.INACTIVE,
  {Name}StatusEnum.PENDING,
]);

export class {Name}Status extends ValueObject<{Name}StatusType> {
  protected validate(value: {Name}StatusType): Result<{Name}StatusType> {
    const result = statusSchema.safeParse(value);

    if (!result.success) {
      return Result.fail("Invalid status");
    }

    return Result.ok(result.data);
  }

  isActive(): boolean {
    return this.value === {Name}StatusEnum.ACTIVE;
  }
}
```

### 4. Events
`src/domain/{name}/events/{event-kebab-case}.event.ts`

```typescript
import { BaseDomainEvent } from "@packages/ddd-kit";

interface {EventName}Payload {
  {aggregateName}Id: string;
  // other relevant fields
}

export class {EventName}Event extends BaseDomainEvent<{EventName}Payload> {
  readonly eventType = "{aggregate}.{action}"; // e.g., "order.created"
  readonly aggregateId: string;
  readonly payload: {EventName}Payload;

  constructor({aggregateName}Id: string, /* other params */) {
    super();
    this.aggregateId = {aggregateName}Id;
    this.payload = { {aggregateName}Id, /* other fields */ };
  }
}
```

## Conventions

1. **Imports**: Use `@packages/ddd-kit` for DDD primitives
2. **Validation**: All VOs use Zod for validation
3. **Result<T>**: Return Result for operations that can fail
4. **Option<T>**: Use Option for nullable properties
5. **Events**: Emit events in create/update methods, not in reconstitute
6. **No external deps**: Domain layer has no external dependencies except Zod

## File Structure

```
src/domain/{aggregate-name}/
├── {aggregate-name}.aggregate.ts
├── {aggregate-name}-id.ts
├── value-objects/
│   ├── {vo-name}.vo.ts
│   └── ...
└── events/
    ├── {aggregate-name}-created.event.ts
    └── ...
```

## Example Usage

```
/gen-domain Subscription with:
- userId: UserId (ref)
- planId: PlanId (VO)
- status: SubscriptionStatus (enum: active, cancelled, past_due)
- currentPeriodStart: Date
- currentPeriodEnd: Date
- cancelAtPeriodEnd: boolean
Events: SubscriptionCreated, SubscriptionCancelled, SubscriptionRenewed
```
