---
name: gen-usecase
description: Generate application layer tests FIRST (TDD), then UseCase, DTOs, Ports following Clean Architecture
---

# UseCase Generator (TDD Approach)

Generate production-ready application layer code following TDD/BDD/Clean Architecture principles. **Tests are written FIRST.**

Reference: `src/application/use-cases/auth/`

## TDD Workflow

```
1. Write Use Case Tests FIRST (Red)
   ├── Happy path tests
   ├── Validation error tests
   ├── Business rule tests
   └── Error handling tests

2. Run tests → They FAIL (expected)

3. Write Implementation (Green)
   ├── Create DTOs
   ├── Create/Update Port interfaces
   ├── Implement Use Case

4. Run tests → They PASS

5. Refactor if needed
```

## Input

PRD use case spec or description:
- Use case name
- Input/Output DTOs
- Business rules
- Events emitted

## Output Files (IN ORDER)

### Phase 1: Tests FIRST

Generate test file BEFORE implementation:

#### 1.1 UseCase Tests (BDD Style)
`src/application/use-cases/{domain}/__tests__/{name}.use-case.test.ts`

```typescript
import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { I{Domain}Repository } from "@/application/ports/{domain}.repository.port";
import { {Name}UseCase } from "../{name}.use-case";
import { {Domain} } from "@/domain/{domain}/{domain}.aggregate";
// Import value objects for test data...

describe("{Name}UseCase", () => {
  // System Under Test
  let sut: {Name}UseCase;

  // Mocks following Clean Architecture (only ports)
  let mock{Domain}Repo: I{Domain}Repository;
  let mockEventDispatcher: IEventDispatcher;

  // Test data using ubiquitous language
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

    // Setup repository mock (all BaseRepository methods)
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

    sut = new {Name}UseCase(mock{Domain}Repo, mockEventDispatcher);
  });

  describe("execute()", () => {
    describe("Happy Path", () => {
      describe("Given valid input", () => {
        it("When executing, Then it should return success with correct output", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.ok(mock{Domain}),
          );

          // When
          const result = await sut.execute(validInput);

          // Then
          expect(result.isSuccess).toBe(true);
          expect(result.getValue()).toMatchObject({
            id: expect.any(String),
            // expected output fields
          });
        });

        it("When executing, Then it should persist via repository", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.ok(mock{Domain}),
          );

          // When
          await sut.execute(validInput);

          // Then
          expect(mock{Domain}Repo.create).toHaveBeenCalledOnce();
        });

        it("When executing, Then it should dispatch domain events AFTER save", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.ok(mock{Domain}),
          );

          // When
          await sut.execute(validInput);

          // Then
          expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
          expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledAfter(
            mock{Domain}Repo.create as any,
          );
        });
      });
    });

    describe("Validation Errors", () => {
      describe("Given invalid {field}", () => {
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
          const inputWithEmptyField = { ...validInput, field: "" };

          // When
          const result = await sut.execute(inputWithEmptyField);

          // Then
          expect(result.isFailure).toBe(true);
        });
      });
    });

    describe("Business Rules", () => {
      describe("Given {entity} already exists", () => {
        it("When executing, Then it should fail with business rule violation", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.some(mock{Domain})),
          );

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
        it("When executing, Then it should propagate the error", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.fail("Database connection error"),
          );

          // When
          const result = await sut.execute(validInput);

          // Then
          expect(result.isFailure).toBe(true);
          expect(result.getError()).toBe("Database connection error");
        });

        it("When save fails, Then events should NOT be dispatched", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.fail("Database error"),
          );

          // When
          await sut.execute(validInput);

          // Then
          expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
        });
      });
    });

    describe("DTO Mapping", () => {
      describe("Given successful execution", () => {
        it("When mapping to output, Then all fields should be correctly transformed", async () => {
          // Given
          vi.mocked(mock{Domain}Repo.findBy).mockResolvedValue(
            Result.ok(Option.none()),
          );
          vi.mocked(mock{Domain}Repo.create).mockResolvedValue(
            Result.ok(mock{Domain}),
          );

          // When
          const result = await sut.execute(validInput);

          // Then
          expect(result.isSuccess).toBe(true);
          const output = result.getValue();
          expect(output.id).toBeDefined();
          // Verify all DTO fields
        });
      });
    });
  });
});
```

---

### Phase 2: Implementation

#### 2.1 UseCase
`src/application/use-cases/{domain}/{name}.use-case.ts`

```typescript
import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  I{Name}InputDto,
  I{Name}OutputDto,
} from "@/application/dto/{name}.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { I{Domain}Repository } from "@/application/ports/{domain}.repository.port";
import type { {Domain} } from "@/domain/{domain}/{domain}.aggregate";
// Import value objects...

export class {Name}UseCase
  implements UseCase<I{Name}InputDto, I{Name}OutputDto>
{
  constructor(
    private readonly {domain}Repo: I{Domain}Repository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: I{Name}InputDto): Promise<Result<I{Name}OutputDto>> {
    // 1. Validate input - create value objects
    const validationResult = this.validateInput(input);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }
    const { /* validated VOs */ } = validationResult.getValue();

    // 2. Check business rules
    const rulesResult = await this.checkBusinessRules(/* params */);
    if (rulesResult.isFailure) {
      return Result.fail(rulesResult.getError());
    }

    // 3. Create/update domain entity
    const entity = {Domain}.create({
      // props from validated VOs
    });

    // 4. Persist
    const saveResult = await this.{domain}Repo.create(entity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    // 5. Dispatch domain events
    await this.eventDispatcher.dispatchAll(entity.domainEvents);
    entity.clearEvents();

    // 6. Return DTO
    return Result.ok(this.toDto(saveResult.getValue()));
  }

  private validateInput(input: I{Name}InputDto): Result<{
    // typed validated values
  }> {
    // Create value objects
    const fieldResult = {VO}.create(input.field);
    if (fieldResult.isFailure) {
      return Result.fail(fieldResult.getError());
    }

    // Combine multiple results if needed
    const combined = Result.combine([fieldResult, /* others */]);
    if (combined.isFailure) {
      return Result.fail(combined.getError());
    }

    return Result.ok({
      field: fieldResult.getValue(),
    });
  }

  private async checkBusinessRules(/* params */): Promise<Result<void>> {
    // Example: check entity doesn't already exist
    const existsResult = await this.{domain}Repo.findBy({ /* criteria */ });
    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    return match<{Domain}, Result<void>>(existsResult.getValue(), {
      Some: () => Result.fail("Entity already exists"),
      None: () => Result.ok(),
    });
  }

  private toDto(entity: {Domain}): I{Name}OutputDto {
    return {
      id: entity.id.value.toString(),
      // map other fields...
    };
  }
}
```

### 2. DTOs
`src/application/dto/{name}.dto.ts`

```typescript
import z from "zod";
// Import common DTOs if needed
// import { userDtoSchema } from "@/application/dto/common.dto";

export const {name}InputDtoSchema = z.object({
  // Input fields with validation
  field: z.string().min(1, "Field is required"),
});

export const {name}OutputDtoSchema = z.object({
  // Output fields
  id: z.string(),
  // other fields...
});

export type I{Name}InputDto = z.infer<typeof {name}InputDtoSchema>;
export type I{Name}OutputDto = z.infer<typeof {name}OutputDtoSchema>;
```

### 3. Repository Port (if new)
`src/application/ports/{domain}.repository.port.ts`

```typescript
import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { {Domain} } from "@/domain/{domain}/{domain}.aggregate";

export interface I{Domain}Repository extends BaseRepository<{Domain}> {
  // Add custom query methods
  findByField(field: string): Promise<Result<Option<{Domain}>>>;
}
```

### 4. DI Registration
Update `common/di/modules/{domain}.module.ts`:

```typescript
import { createModule } from "@evyweb/ioctopus";
import { {Name}UseCase } from "@/application/use-cases/{domain}/{name}.use-case";
import { DI_SYMBOLS } from "../types";

export const create{Domain}Module = () => {
  const module = createModule();

  // Bind repository (if new)
  module.bind(DI_SYMBOLS.I{Domain}Repository).toClass(Drizzle{Domain}Repository);

  // Bind use case
  module
    .bind(DI_SYMBOLS.{Name}UseCase)
    .toClass({Name}UseCase, [
      DI_SYMBOLS.I{Domain}Repository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return module;
};
```

Update `common/di/types.ts`:

```typescript
export const DI_SYMBOLS = {
  // ... existing symbols
  I{Domain}Repository: Symbol.for("I{Domain}Repository"),
  {Name}UseCase: Symbol.for("{Name}UseCase"),
};
```

## Conventions

1. **Constructor injection**: All dependencies injected via constructor
2. **Result<T>**: All async operations return Result
3. **Option<T>**: Repository finds return Option
4. **match()**: Use pattern matching for Option handling
5. **Event dispatch**: Always dispatch after successful persistence
6. **Clear events**: Call `entity.clearEvents()` after dispatch

## Use Case Patterns

### Query Use Case (no events)
```typescript
async execute(input: I{Name}InputDto): Promise<Result<I{Name}OutputDto>> {
  const result = await this.repo.findById(input.id);
  if (result.isFailure) return Result.fail(result.getError());

  return match<{Domain}, Result<I{Name}OutputDto>>(result.getValue(), {
    Some: (entity) => Result.ok(this.toDto(entity)),
    None: () => Result.fail("Not found"),
  });
}
```

### Command Use Case (with events)
```typescript
async execute(input: I{Name}InputDto): Promise<Result<I{Name}OutputDto>> {
  // Validate -> Check rules -> Mutate -> Persist -> Dispatch events -> Return DTO
}
```

## Example Usage

```
/gen-usecase CreateSubscription for Subscription domain:
- Input: userId, planId, paymentMethodId
- Output: subscriptionId, status, currentPeriodEnd
- Rules: User must not have active subscription, Plan must exist
- Events: SubscriptionCreated
```
