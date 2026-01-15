---
name: gen-domain
description: Generate domain layer tests FIRST (TDD), then implementation code following DDD and Clean Architecture
---

# Domain Generator (TDD Approach)

Generate production-ready domain code following TDD/BDD/DDD principles. **Tests are written FIRST, then implementation.**

Reference: `src/domain/user/`

## TDD Workflow

```
1. Write Tests FIRST (Red)
   ├── Aggregate tests
   ├── Value Object tests
   └── Event tests

2. Run tests → They FAIL (expected)

3. Write Implementation (Green)
   ├── Implement Aggregate
   ├── Implement Value Objects
   └── Implement Events

4. Run tests → They PASS

5. Refactor if needed
```

## Input

PRD section describing domain model, or direct specification:
- Aggregate name and properties
- Value Objects needed
- Events to emit

## Output Files (IN ORDER)

### Phase 1: Tests FIRST

Generate test files BEFORE implementation in `src/domain/{aggregate-kebab-case}/__tests__/`:

#### 1.1 Aggregate Tests (BDD Style)
`src/domain/{name}/__tests__/{name}.aggregate.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { {Name} } from "../{name}.aggregate";
import { {Name}CreatedEvent } from "../events/{name}-created.event";
// Import value objects...

describe("{Name} Aggregate", () => {
  // Test data following ubiquitous language
  const validProps = {
    // Define valid properties using domain language
  };

  describe("create()", () => {
    describe("Given valid properties", () => {
      it("When creating a new {Name}, Then it should succeed with correct state", () => {
        // Given
        const props = { ...validProps };

        // When
        const entity = {Name}.create(props);

        // Then
        expect(entity).toBeDefined();
        expect(entity.id).toBeDefined();
        expect(entity.get("createdAt")).toBeInstanceOf(Date);
      });

      it("When creating a new {Name}, Then it should emit {Name}Created event", () => {
        // Given
        const props = { ...validProps };

        // When
        const entity = {Name}.create(props);

        // Then
        expect(entity.domainEvents).toHaveLength(1);
        expect(entity.domainEvents[0]).toBeInstanceOf({Name}CreatedEvent);
        expect(entity.domainEvents[0].eventType).toBe("{name}.created");
      });
    });

    describe("Given an existing ID", () => {
      it("When creating with ID, Then it should NOT emit creation event", () => {
        // Given
        const existingId = new UUID();
        const props = { ...validProps };

        // When
        const entity = {Name}.create(props, existingId);

        // Then
        expect(entity.id.value).toBe(existingId.value);
        expect(entity.domainEvents).toHaveLength(0);
      });
    });
  });

  describe("reconstitute()", () => {
    describe("Given persisted data", () => {
      it("When reconstituting, Then it should NOT emit any events", () => {
        // Given
        const id = {Name}Id.create(new UUID());
        const props = { ...validProps, createdAt: new Date() };

        // When
        const entity = {Name}.reconstitute(props, id);

        // Then
        expect(entity.domainEvents).toHaveLength(0);
      });
    });
  });

  describe("domain methods", () => {
    describe("{methodName}()", () => {
      describe("Given a valid {Name}", () => {
        it("When {action}, Then state should change accordingly", () => {
          // Given
          const entity = {Name}.create(validProps);
          entity.clearEvents();

          // When
          entity.{methodName}(newValue);

          // Then
          expect(entity.get("property")).toEqual(newValue);
          expect(entity.get("updatedAt")).toBeInstanceOf(Date);
        });

        it("When {action}, Then it should emit appropriate event", () => {
          // Given
          const entity = {Name}.create(validProps);
          entity.clearEvents();

          // When
          entity.{methodName}(newValue);

          // Then
          expect(entity.domainEvents).toHaveLength(1);
          expect(entity.domainEvents[0].eventType).toBe("{name}.{action}");
        });
      });
    });
  });
});
```

#### 1.2 Value Object Tests (BDD Style)
`src/domain/{name}/__tests__/{vo-name}.vo.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { {VoName} } from "../value-objects/{vo-name}.vo";

describe("{VoName} Value Object", () => {
  describe("create()", () => {
    describe("Given a valid value", () => {
      it("When creating, Then it should succeed", () => {
        // Given
        const validValue = "valid-value";

        // When
        const result = {VoName}.create(validValue);

        // Then
        expect(result.isSuccess).toBe(true);
        expect(result.getValue().value).toBe(validValue);
      });
    });

    describe("Given an empty value", () => {
      it("When creating, Then it should fail with validation error", () => {
        // Given
        const emptyValue = "";

        // When
        const result = {VoName}.create(emptyValue);

        // Then
        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("required");
      });
    });

    describe("Given a value exceeding max length", () => {
      it("When creating, Then it should fail", () => {
        // Given
        const tooLongValue = "a".repeat(256);

        // When
        const result = {VoName}.create(tooLongValue);

        // Then
        expect(result.isFailure).toBe(true);
      });
    });
  });

  describe("equals()", () => {
    describe("Given two VOs with same value", () => {
      it("When comparing, Then they should be equal", () => {
        // Given
        const vo1 = {VoName}.create("value").getValue();
        const vo2 = {VoName}.create("value").getValue();

        // When/Then
        expect(vo1.equals(vo2)).toBe(true);
      });
    });

    describe("Given two VOs with different values", () => {
      it("When comparing, Then they should not be equal", () => {
        // Given
        const vo1 = {VoName}.create("value1").getValue();
        const vo2 = {VoName}.create("value2").getValue();

        // When/Then
        expect(vo1.equals(vo2)).toBe(false);
      });
    });
  });
});
```

#### 1.3 Domain Event Tests
`src/domain/{name}/__tests__/{event-name}.event.test.ts`

```typescript
import { describe, expect, it } from "vitest";
import { {EventName}Event } from "../events/{event-name}.event";

describe("{EventName}Event", () => {
  describe("constructor", () => {
    describe("Given valid aggregate data", () => {
      it("When creating event, Then payload should be correctly populated", () => {
        // Given
        const aggregateId = "test-id";
        const payload = { /* relevant data */ };

        // When
        const event = new {EventName}Event(aggregateId, payload);

        // Then
        expect(event.eventType).toBe("{aggregate}.{action}");
        expect(event.aggregateId).toBe(aggregateId);
        expect(event.payload).toMatchObject(payload);
        expect(event.occurredAt).toBeInstanceOf(Date);
      });
    });
  });
});
```

---

### Phase 2: Implementation

Generate implementation files in `src/domain/{aggregate-kebab-case}/`:

#### 2.1 Aggregate ID
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
