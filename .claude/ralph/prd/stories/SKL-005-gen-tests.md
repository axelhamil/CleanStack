# SKL-005: /gen-tests Skill

## Story

**As a** developer
**I want** a test generation skill
**So that** I can scaffold BDD tests for use cases

## Acceptance Criteria

- [ ] Skill file: `.claude/skills/gen-tests.md`
- [ ] Generates BDD-style tests
- [ ] Mocks repositories at correct level
- [ ] Tests all Result/Option states
- [ ] Tests event emission

## Technical Notes

### Skill File

```markdown
---
name: gen-tests
description: Generate BDD-style tests for use cases
---

# Test Generator

Generate comprehensive BDD tests for use cases.

## Input

Use case file or name to test.

## Output

Test file: `src/application/use-cases/{domain}/__tests__/{name}.use-case.test.ts`

## Test Structure

### 1. Happy Path
- Should succeed with valid input
- Should return correct DTO
- Should emit expected events

### 2. Validation Errors
- Should fail with invalid email
- Should fail with missing required field

### 3. Business Rule Violations
- Should fail when [rule violated]

### 4. Repository Errors
- Should fail when save fails
- Should not emit events on save failure

## Template

\`\`\`typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Result, Option } from "@repo/ddd-kit";
import { {Name}UseCase } from "../{name}.use-case";
import type { I{Domain}Repository } from "@/application/ports/i-{domain}-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";

describe("{Name}UseCase", () => {
  let useCase: {Name}UseCase;
  let mockRepo: I{Domain}Repository;
  let mockDispatcher: IEventDispatcher;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      // ... other methods
    };
    mockDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    useCase = new {Name}UseCase(mockRepo, mockDispatcher);
  });

  describe("happy path", () => {
    it("should {action} when {condition}", async () => {
      // Arrange
      mockRepo.create.mockResolvedValue(Result.ok(mock{Domain}));

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toMatchObject({
        // expected output
      });
    });

    it("should emit {Event} event", async () => {
      // Arrange
      mockRepo.create.mockResolvedValue(Result.ok(mock{Domain}));

      // Act
      await useCase.execute(validInput);

      // Assert
      expect(mockDispatcher.dispatchAll).toHaveBeenCalled();
      const events = mockDispatcher.dispatchAll.mock.calls[0][0];
      expect(events[0].eventType).toBe("{domain}.created");
    });
  });

  describe("validation errors", () => {
    it("should fail when email is invalid", async () => {
      const result = await useCase.execute({ ...validInput, email: "invalid" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("email");
    });
  });

  describe("business rules", () => {
    it("should fail when {rule violated}", async () => {
      mockRepo.findById.mockResolvedValue(Result.ok(Option.some(existing)));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should not emit events when save fails", async () => {
      mockRepo.create.mockResolvedValue(Result.fail("DB error"));

      await useCase.execute(validInput);

      expect(mockDispatcher.dispatchAll).not.toHaveBeenCalled();
    });
  });
});
\`\`\`

## Naming Convention

Test names follow: "should [action] when [condition]"

Examples:
- should create user when email is unique
- should fail when password is too short
- should emit UserCreated event on success
```

### Usage

```
/gen-tests CreateSubscriptionUseCase
```

## Definition of Done

- [ ] Skill file created
- [ ] Template covers all test types
- [ ] Generated tests follow BDD style
