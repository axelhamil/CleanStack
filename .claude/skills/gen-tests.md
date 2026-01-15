---
name: gen-tests
description: Generate BDD-style tests for use cases and domain entities
---

# Test Generator

Generate comprehensive BDD-style tests for use cases and domain. Reference: `src/__TESTS__/`

## Input

Use case or domain entity to test.

## Output

Test file: `src/__TESTS__/{name}.test.ts`

## Test Structure

### UseCase Tests

```typescript
import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { I{Provider}Provider } from "@/application/ports/{provider}.port";
import type { I{Domain}Repository } from "@/application/ports/{domain}.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { {Name}UseCase } from "@/application/use-cases/{domain}/{name}.use-case";
import { {Domain} } from "@/domain/{domain}/{domain}.aggregate";
// Import value objects for test data...

describe("{Name}UseCase", () => {
  let useCase: {Name}UseCase;
  let mock{Domain}Repo: I{Domain}Repository;
  let mockEventDispatcher: IEventDispatcher;

  // Valid test input
  const validInput = {
    field: "valid-value",
    // ... other fields
  };

  // Mock domain entity
  const mock{Domain} = {Domain}.create({
    // valid props with VOs
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
      // Custom methods...
    };

    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };

    useCase = new {Name}UseCase(mock{Domain}Repo, mockEventDispatcher);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return success when input is valid", async () => {
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.ok(mock{Domain}),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toMatchObject({
          id: expect.any(String),
          // expected output fields
        });
      });

      it("should call repository with correct arguments", async () => {
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.ok(mock{Domain}),
        );

        await useCase.execute(validInput);

        expect(mock{Domain}Repo.create).toHaveBeenCalledOnce();
        expect(mock{Domain}Repo.create).toHaveBeenCalledWith(
          expect.objectContaining({
            // expected entity properties
          }),
        );
      });

      it("should dispatch domain events on success", async () => {
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.ok(mock{Domain}),
        );

        await useCase.execute(validInput);

        expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
        const events = vi.mocked(mockEventDispatcher.dispatchAll).mock.calls[0][0];
        expect(events).toHaveLength(1);
        expect(events[0].eventType).toBe("{domain}.created");
      });
    });

    describe("validation errors", () => {
      it("should fail when {field} is invalid", async () => {
        const result = await useCase.execute({
          ...validInput,
          field: "invalid",
        });

        expect(result.isFailure).toBe(true);
        expect(mock{Domain}Repo.create).not.toHaveBeenCalled();
      });

      it("should fail when {field} is empty", async () => {
        const result = await useCase.execute({
          ...validInput,
          field: "",
        });

        expect(result.isFailure).toBe(true);
      });

      it("should fail when required field is missing", async () => {
        const { requiredField, ...inputWithoutField } = validInput;

        const result = await useCase.execute(inputWithoutField as any);

        expect(result.isFailure).toBe(true);
      });
    });

    describe("business rules", () => {
      it("should fail when {entity} already exists", async () => {
        vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
          Result.ok(Option.some(mock{Domain})),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("already exists");
      });

      it("should succeed when {entity} does not exist", async () => {
        vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
          Result.ok(Option.none()),
        );
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.ok(mock{Domain}),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
      });
    });

    describe("error handling", () => {
      it("should fail when repository returns error", async () => {
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Database connection error");
      });

      it("should not dispatch events when save fails", async () => {
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.fail("Database error"),
        );

        await useCase.execute(validInput);

        expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
      });
    });

    describe("DTO mapping", () => {
      it("should map entity correctly to output DTO", async () => {
        vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
          Result.ok(mock{Domain}),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.id).toBeDefined();
        // Verify all DTO fields are correctly mapped
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
