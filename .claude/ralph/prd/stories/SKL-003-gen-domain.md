# SKL-003: /gen-domain Skill

## Story

**As a** developer
**I want** a domain generation skill
**So that** I can scaffold domain entities from PRD specs

## Acceptance Criteria

- [ ] Skill file: `.claude/skills/gen-domain.md`
- [ ] Generates: Aggregate, Value Objects, Events
- [ ] Follows project conventions
- [ ] Uses ddd-kit primitives
- [ ] Output is production-ready code

## Technical Notes

### Skill File

```markdown
---
name: gen-domain
description: Generate domain layer code from PRD specification
---

# Domain Generator

Generate production-ready domain code following project conventions.

## Input

PRD section describing domain model, or direct specification:
- Aggregate name and properties
- Value Objects needed
- Events to emit

## Output

Generate these files:

### 1. Aggregate
`src/domain/{aggregate}/{aggregate}.aggregate.ts`

### 2. ID Type
`src/domain/{aggregate}/{aggregate}-id.ts`

### 3. Value Objects
`src/domain/{aggregate}/value-objects/{vo}.vo.ts`

### 4. Events
`src/domain/{aggregate}/events/{event}.event.ts`

## Conventions

- Use Result<T> for validation
- Use Option<T> for nullable
- Events emitted in create/update methods
- No external dependencies

## Template: Aggregate

\`\`\`typescript
import { Aggregate, UUID } from "@repo/ddd-kit";
import { {Name}Id } from "./{name}-id";
import { {Event}Event } from "./events/{event}.event";

interface I{Name}Props {
  // properties
  createdAt: Date;
  updatedAt?: Date;
}

export class {Name} extends Aggregate<I{Name}Props> {
  get id(): {Name}Id {
    return {Name}Id.create(this._id);
  }

  static create(props: Omit<I{Name}Props, "createdAt">, id?: UUID): {Name} {
    const entity = new {Name}(
      { ...props, createdAt: new Date() },
      id ?? new UUID()
    );
    entity.addEvent(new {Name}CreatedEvent(entity));
    return entity;
  }

  // Methods that modify state and emit events
}
\`\`\`

## Template: Value Object

\`\`\`typescript
import { ValueObject, Result } from "@repo/ddd-kit";
import { z } from "zod";

const schema = z.string().min(1).max(100);

export class {Name} extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      return Result.fail(result.error.errors[0].message);
    }
    return Result.ok(result.data);
  }
}
\`\`\`
```

### Usage

```
/gen-domain Subscription aggregate with status, userId, planId, startDate, endDate
```

## Definition of Done

- [ ] Skill file created
- [ ] Templates match project conventions
- [ ] Tested with sample aggregate
