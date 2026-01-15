---
name: gen-tests
description: Generate BDD-style tests FIRST (TDD) for use cases and domain entities with Given/When/Then format
---

# Test Generator (TDD-First)

Generate comprehensive BDD-style tests **BEFORE** writing implementation code. This skill follows TDD principles.

Reference: `src/__TESTS__/` and `src/domain/*/__tests__/`

## TDD Principle

```
RED → GREEN → REFACTOR

1. Write test FIRST (this skill)
2. Run test → FAILS (Red) ✓ Expected
3. Write minimal code to pass
4. Run test → PASSES (Green)
5. Refactor if needed
```

## Input

Use case or domain entity to test. **Provide specification, not implementation.**

## Output

Test file with BDD format: `Given [context] / When [action] / Then [expectation]`

## BDD Test Structure

### Naming Convention

```typescript
describe("[Context]", () => {
  describe("Given [precondition]", () => {
    it("When [action], Then [expected outcome]", () => {
      // Given - Setup
      // When - Action
      // Then - Assertions
    });
  });
});
```

### UseCase Tests (BDD)

```typescript
import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { I{Domain}Repository } from "@/application/ports/{domain}.repository.port";
import { {Name}UseCase } from "@/application/use-cases/{domain}/{name}.use-case";
import { {Domain} } from "@/domain/{domain}/{domain}.aggregate";

describe("{Name}UseCase", () => {
  // System Under Test
  let sut: {Name}UseCase;

  // Mocks (Clean Architecture: only mock ports/interfaces)
  let mock{Domain}Repo: I{Domain}Repository;
  let mockEventDispatcher: IEventDispatcher;

  // Test fixtures using ubiquitous language
  const validInput = {
    field: "valid-value",
  };

  const mock{Domain} = {Domain}.create({
    // valid props
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mock{Domain}Repo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    };

    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };

    sut = new {Name}UseCase(mock{Domain}Repo, mockEventDispatcher);
  });

  describe("execute()", () => {
    describe("Happy Path", () => {
      describe("Given valid input and no existing entity", () => {
        beforeEach(() => {
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.ok(mock{Domain}),
          );
        });

        it("When executing, Then it should return success", async () => {
          // Given (setup in beforeEach)

          // When
          const result = await sut.execute(validInput);

          // Then
          expect(result.isSuccess).toBe(true);
          expect(result.getValue()).toMatchObject({
            id: expect.any(String),
          });
        });

        it("When executing, Then it should persist via repository", async () => {
          // When
          await sut.execute(validInput);

          // Then
          expect(mock{Domain}Repo.create).toHaveBeenCalledOnce();
        });

        it("When executing, Then it should dispatch domain events AFTER save", async () => {
          // When
          await sut.execute(validInput);

          // Then
          expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
        });
      });
    });

    describe("Validation Errors", () => {
      describe("Given invalid field value", () => {
        it("When executing, Then it should fail with validation error", async () => {
          // Given
          const invalidInput = { ...validInput, field: "invalid" };

          // When
          const result = await sut.execute(invalidInput);

          // Then
          expect(result.isFailure).toBe(true);
          expect(mock{Domain}Repo.create).not.toHaveBeenCalled();
        });
      });

      describe("Given empty required field", () => {
        it("When executing, Then it should fail", async () => {
          // Given
          const emptyInput = { ...validInput, field: "" };

          // When
          const result = await sut.execute(emptyInput);

          // Then
          expect(result.isFailure).toBe(true);
        });
      });
    });

    describe("Business Rules", () => {
      describe("Given entity already exists", () => {
        beforeEach(() => {
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.some(mock{Domain})),
          );
        });

        it("When executing, Then it should fail with business rule violation", async () => {
          // When
          const result = await sut.execute(validInput);

          // Then
          expect(result.isFailure).toBe(true);
          expect(result.getError()).toContain("already exists");
          expect(mock{Domain}Repo.create).not.toHaveBeenCalled();
        });
      });
    });

    describe("Error Handling", () => {
      describe("Given repository failure", () => {
        beforeEach(() => {
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.fail("Database connection error"),
          );
        });

        it("When executing, Then it should propagate the error", async () => {
          // When
          const result = await sut.execute(validInput);

          // Then
          expect(result.isFailure).toBe(true);
          expect(result.getError()).toBe("Database connection error");
        });

        it("When save fails, Then events should NOT be dispatched", async () => {
          // When
          await sut.execute(validInput);

          // Then
          expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
        });
      });
    });
  });
});
```

### Domain Aggregate Tests

```typescript
import { Option } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { {Domain} } from "@/domain/{domain}/{domain}.aggregate";
import { {EventName}Event } from "@/domain/{domain}/events/{event-name}.event";
// Import value objects...

describe("{Domain} Aggregate", () => {
  describe("create()", () => {
    it("should create with valid properties", () => {
      const entity = {Domain}.create({
        // valid props
      });

      expect(entity).toBeDefined();
      expect(entity.id).toBeDefined();
      expect(entity.get("property")).toBe(expectedValue);
    });

    it("should emit {Domain}Created event on creation", () => {
      const entity = {Domain}.create({
        // valid props
      });

      expect(entity.domainEvents).toHaveLength(1);
      expect(entity.domainEvents[0]).toBeInstanceOf({Domain}CreatedEvent);
    });

    it("should set createdAt to current date", () => {
      const before = new Date();
      const entity = {Domain}.create({
        // valid props
      });
      const after = new Date();

      const createdAt = entity.get("createdAt");
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("reconstitute()", () => {
    it("should reconstitute without emitting events", () => {
      const entity = {Domain}.reconstitute(
        {
          // props
        },
        id,
      );

      expect(entity.domainEvents).toHaveLength(0);
    });
  });

  describe("domain methods", () => {
    describe("update{Property}()", () => {
      it("should update property and emit event", () => {
        const entity = {Domain}.create({ /* props */ });
        entity.clearEvents();

        entity.update{Property}(newValue);

        expect(entity.get("property")).toEqual(newValue);
        expect(entity.domainEvents).toHaveLength(1);
      });

      it("should update updatedAt timestamp", () => {
        const entity = {Domain}.create({ /* props */ });
        const originalUpdatedAt = entity.get("updatedAt");

        entity.update{Property}(newValue);

        expect(entity.get("updatedAt").getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime(),
        );
      });
    });
  });
});
```

### Value Object Tests

```typescript
import { describe, expect, it } from "vitest";
import { {VOName} } from "@/domain/{domain}/value-objects/{vo-name}.vo";

describe("{VOName} Value Object", () => {
  describe("create()", () => {
    it("should create with valid value", () => {
      const result = {VOName}.create("valid-value");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("valid-value");
    });

    it("should fail when value is empty", () => {
      const result = {VOName}.create("");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("required");
    });

    it("should fail when value is too long", () => {
      const result = {VOName}.create("a".repeat(256));

      expect(result.isFailure).toBe(true);
    });

    it("should normalize value (if applicable)", () => {
      const result = {VOName}.create("  VALUE  ");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("value");
    });
  });

  describe("equals()", () => {
    it("should return true for same value", () => {
      const vo1 = {VOName}.create("value").getValue();
      const vo2 = {VOName}.create("value").getValue();

      expect(vo1.equals(vo2)).toBe(true);
    });

    it("should return false for different values", () => {
      const vo1 = {VOName}.create("value1").getValue();
      const vo2 = {VOName}.create("value2").getValue();

      expect(vo1.equals(vo2)).toBe(false);
    });
  });
});
```

## Naming Convention

Test names follow BDD pattern: `"should [action] when [condition]"`

Examples:
- should create user when email is unique
- should fail when password is too short
- should emit UserCreated event on success
- should not dispatch events when save fails

## Test Categories

1. **Happy Path**: Normal success cases
2. **Validation Errors**: Input validation failures
3. **Business Rules**: Domain rule violations
4. **Error Handling**: Repository/provider failures
5. **DTO Mapping**: Output format verification
6. **Event Emission**: Domain events verification

## Example Usage

```
/gen-tests CreateSubscriptionUseCase
```

Will generate tests covering:
- Creating subscription with valid input
- Validation errors (invalid planId, missing fields)
- Business rules (user already subscribed)
- Repository errors
- Event emission (SubscriptionCreated)
- DTO mapping verification
