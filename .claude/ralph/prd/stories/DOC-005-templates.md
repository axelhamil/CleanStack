# DOC-005: Templates Section

## Story

**As a** developer
**I want** copy-paste templates in CLAUDE.md
**So that** I can quickly scaffold code

## Acceptance Criteria

- [ ] Aggregate template
- [ ] ValueObject template
- [ ] UseCase template
- [ ] Test template
- [ ] All templates match current patterns

## Content

```markdown
## Templates

### Aggregate Template

\`\`\`typescript
// src/domain/{name}/{name}.aggregate.ts
import { Aggregate, UUID } from "@repo/ddd-kit";
import { {Name}Id } from "./{name}-id";
import { {Name}CreatedEvent } from "./events/{name}-created.event";

interface I{Name}Props {
  // Add properties
  createdAt: Date;
  updatedAt?: Date;
}

export class {Name} extends Aggregate<I{Name}Props> {
  get id(): {Name}Id {
    return {Name}Id.create(this._id);
  }

  // Add getters for props

  static create(
    props: Omit<I{Name}Props, "createdAt" | "updatedAt">,
    id?: UUID
  ): {Name} {
    const entity = new {Name}(
      { ...props, createdAt: new Date() },
      id ?? new UUID()
    );
    entity.addEvent(new {Name}CreatedEvent(entity));
    return entity;
  }

  // Add methods that modify state
}
\`\`\`

### Value Object Template

\`\`\`typescript
// src/domain/{aggregate}/value-objects/{name}.vo.ts
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

### UseCase Template

\`\`\`typescript
// src/application/use-cases/{domain}/{name}.use-case.ts
import { UseCase, Result, match } from "@repo/ddd-kit";
import type { I{Name}InputDto, I{Name}OutputDto } from "@/application/dto/{domain}/{name}.dto";

export class {Name}UseCase implements UseCase<I{Name}InputDto, I{Name}OutputDto> {
  constructor(
    private readonly repo: IRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: I{Name}InputDto): Promise<Result<I{Name}OutputDto>> {
    // 1. Validate & create VOs
    // 2. Business logic
    // 3. Persist
    // 4. Dispatch events
    // 5. Return DTO
  }
}
\`\`\`

### Test Template

\`\`\`typescript
// src/application/use-cases/{domain}/__tests__/{name}.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Result, Option } from "@repo/ddd-kit";

describe("{Name}UseCase", () => {
  let useCase: {Name}UseCase;
  let mockRepo: MockRepo;

  beforeEach(() => {
    mockRepo = { method: vi.fn() };
    useCase = new {Name}UseCase(mockRepo);
  });

  describe("happy path", () => {
    it("should {action} when {condition}", async () => {
      // Arrange
      mockRepo.method.mockResolvedValue(Result.ok(value));

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
    });
  });
});
\`\`\`
```

## Definition of Done

- [ ] All templates added
- [ ] Templates compile
- [ ] Match current patterns
