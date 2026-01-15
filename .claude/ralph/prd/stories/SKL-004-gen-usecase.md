# SKL-004: /gen-usecase Skill

## Story

**As a** developer
**I want** a use case generation skill
**So that** I can scaffold application layer from PRD specs

## Acceptance Criteria

- [ ] Skill file: `.claude/skills/gen-usecase.md`
- [ ] Generates: UseCase, DTOs, Port interface
- [ ] Follows project conventions
- [ ] Includes DI registration
- [ ] Event dispatch pattern included

## Technical Notes

### Skill File

```markdown
---
name: gen-usecase
description: Generate application layer code (UseCase, DTOs, Ports) from PRD specification
---

# UseCase Generator

Generate production-ready application layer code.

## Input

PRD use case spec or description:
- Use case name
- Input/Output DTOs
- Business rules
- Events emitted

## Output Files

### 1. UseCase
`src/application/use-cases/{domain}/{name}.use-case.ts`

### 2. Input DTO
`src/application/dto/{domain}/{name}-input.dto.ts`

### 3. Output DTO
`src/application/dto/{domain}/{name}-output.dto.ts`

### 4. Port (if new repository method needed)
Update `src/application/ports/i-{domain}-repository.port.ts`

### 5. DI Registration
Update `common/di/modules/{domain}.module.ts`

## Template: UseCase

\`\`\`typescript
import { UseCase, Result, match } from "@repo/ddd-kit";
import type { I{Domain}Repository } from "@/application/ports/i-{domain}-repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { I{Name}InputDto, I{Name}OutputDto } from "@/application/dto/{domain}/{name}.dto";

export class {Name}UseCase implements UseCase<I{Name}InputDto, I{Name}OutputDto> {
  constructor(
    private readonly {domain}Repo: I{Domain}Repository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: I{Name}InputDto): Promise<Result<I{Name}OutputDto>> {
    // 1. Validate input / Create VOs
    const validationResult = this.validateInput(input);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }

    // 2. Business logic
    // ...

    // 3. Persist
    const saveResult = await this.{domain}Repo.create(entity);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    // 4. Dispatch events
    await this.eventDispatcher.dispatchAll(entity.domainEvents);
    entity.clearEvents();

    // 5. Return DTO
    return Result.ok(this.toDto(entity));
  }

  private validateInput(input: I{Name}InputDto): Result<void> {
    // VO creation and validation
    return Result.ok(undefined);
  }

  private toDto(entity: {Domain}): I{Name}OutputDto {
    return {
      id: entity.id.value,
      // ...
    };
  }
}
\`\`\`

## Template: DTO

\`\`\`typescript
import { z } from "zod";

export const {name}InputDtoSchema = z.object({
  // fields
});

export const {name}OutputDtoSchema = z.object({
  // fields
});

export type I{Name}InputDto = z.infer<typeof {name}InputDtoSchema>;
export type I{Name}OutputDto = z.infer<typeof {name}OutputDtoSchema>;
\`\`\`

## Template: DI Registration

\`\`\`typescript
// common/di/modules/{domain}.module.ts
m.bind(DI_SYMBOLS.{Name}UseCase).toClass(
  {Name}UseCase,
  [DI_SYMBOLS.I{Domain}Repository, DI_SYMBOLS.IEventDispatcher]
);
\`\`\`
```

### Usage

```
/gen-usecase CreateSubscription: creates subscription for user with planId
```

## Definition of Done

- [ ] Skill file created
- [ ] Templates include event dispatch
- [ ] DI registration included
