# AI Workflow

This boilerplate is optimized for AI-assisted development with Claude.

## Overview

The AI workflow accelerates development while maintaining architectural consistency:

```
New Feature Request
       │
       ▼
┌──────────────┐
│ EventStorming│ → Discover domain events and aggregates
└──────────────┘
       │
       ▼
┌──────────────┐
│  Feature PRD │ → Document requirements and stories
└──────────────┘
       │
       ▼
┌──────────────┐
│  Gen Domain  │ → Create domain layer files
└──────────────┘
       │
       ▼
┌──────────────┐
│ Gen UseCase  │ → Create use cases and DTOs
└──────────────┘
       │
       ▼
┌──────────────┐
│  Implement   │ → Repository, UI, API routes
└──────────────┘
       │
       ▼
┌──────────────┐
│  Gen Tests   │ → Add BDD tests
└──────────────┘
       │
       ▼
┌──────────────┐
│   Commit     │ → Atomic conventional commit
└──────────────┘
```

## Skills Reference

| Skill | Purpose | Example |
|-------|---------|---------|
| `/eventstorming` | Discover domain events, commands, aggregates | `/eventstorming "User billing"` |
| `/feature-prd` | Generate feature specification with stories | `/feature-prd "Export data" --events DataExported` |
| `/gen-domain` | Create aggregate, VOs, events | `/gen-domain Invoice` |
| `/gen-usecase` | Create use case, DTO, port | `/gen-usecase SendInvoice` |
| `/gen-tests` | Generate BDD tests for use case | `/gen-tests SendInvoiceUseCase` |

### /eventstorming

Start here for new features. Identifies the domain model.

**Input:**
```
/eventstorming "Subscription billing with monthly payments"
```

**Output:**
- Commands: CreateSubscription, CancelSubscription, ProcessPayment
- Events: SubscriptionCreated, PaymentProcessed, SubscriptionCancelled
- Aggregates: Subscription, Payment
- Value Objects: SubscriptionId, PlanId, Amount

### /feature-prd

Documents requirements as user stories with acceptance criteria.

**Input:**
```
/feature-prd "Subscription management" --events SubscriptionCreated,SubscriptionCancelled
```

**Output:**
- User stories
- Acceptance criteria
- Technical notes
- API endpoints

### /gen-domain

Generates domain layer following project patterns.

**Input:**
```
/gen-domain Subscription
```

**Output:**
```
src/domain/subscription/
├── subscription.aggregate.ts
├── subscription-id.vo.ts
├── plan.vo.ts
└── events/
    ├── subscription-created.event.ts
    └── subscription-cancelled.event.ts
```

### /gen-usecase

Generates complete use case with DI wiring.

**Input:**
```
/gen-usecase CreateSubscription
```

**Output:**
```
src/application/use-cases/subscription/
└── create-subscription.use-case.ts

src/application/dto/subscription/
└── create-subscription.dto.ts

src/application/ports/
└── i-subscription-repository.ts  (if not exists)
```

### /gen-tests

Generates BDD tests mocking at repository level.

**Input:**
```
/gen-tests CreateSubscriptionUseCase
```

**Output:**
```
src/application/use-cases/subscription/__TESTS__/
└── create-subscription.use-case.test.ts
```

## Agents Reference

Agents work automatically based on context.

| Agent | Trigger | Purpose |
|-------|---------|---------|
| `feature-architect` | "How should I implement..." | Architectural guidance |
| `code-reviewer` | After code changes | Quality and pattern review |
| `test-writer` | After UseCase creation | Generate BDD tests |
| `doc-writer` | Before release | Documentation updates |

### feature-architect

Provides architectural guidance before implementation.

**Triggers on:**
- "How should I structure..."
- "What's the best approach for..."
- "Help me design..."

### code-reviewer

Reviews code for patterns, quality, and conventions.

**Triggers on:**
- After significant code changes
- When asked to review

**Checks:**
- Clean Architecture compliance
- DDD patterns
- Error handling (Result/Option)
- Test coverage

### test-writer

Generates comprehensive BDD tests.

**Triggers on:**
- After UseCase creation
- When asked for tests

### doc-writer

Updates documentation to match code.

**Triggers on:**
- Before release
- When docs are outdated

## Tips for Effective AI Development

### 1. Work Step by Step

Don't rush through all steps at once. Commit after each phase:

```bash
# After domain generation
git commit -m "feat(subscription): add subscription domain"

# After use cases
git commit -m "feat(subscription): add subscription use cases"

# After UI
git commit -m "feat(subscription): add subscription pages"
```

### 2. Review Generated Code

AI generates code quickly, but verify:
- Does it match your requirements?
- Are edge cases handled?
- Is the naming consistent?

### 3. Provide Context

Better prompts = better results:

```
# Less effective
/gen-usecase UpdateUser

# More effective
/gen-usecase UpdateUser --context "User can update name and email, email requires reverification"
```

### 4. Use CLAUDE.md

The `CLAUDE.md` file teaches Claude the project patterns. Keep it updated.

### 5. Ask Questions First

If unsure about approach:
> "How should I implement X? What patterns should I follow?"

### 6. Let Hooks Guide You

The auto-routing hook suggests skills based on your request. Trust its suggestions.

## Common Workflows

### Adding a New Aggregate

```
1. /eventstorming "feature description"
2. /gen-domain AggregateName
3. Review and adjust generated code
4. Commit: feat(feature): add aggregate domain
```

### Adding a New Use Case

```
1. /gen-usecase UseCaseName
2. Implement repository if needed
3. /gen-tests UseCaseNameUseCase
4. Commit: feat(feature): add use case
```

### Building Complete Feature

```
1. /eventstorming "feature"
2. /feature-prd "feature"
3. /gen-domain Aggregate
4. /gen-usecase UseCase1
5. /gen-usecase UseCase2
6. Implement repository
7. Create UI
8. /gen-tests
9. Commit: feat(feature): complete feature
```

## Troubleshooting

### Skills Not Working

1. Check `CLAUDE.md` is in project root
2. Verify hooks are enabled in Claude settings
3. Try explicit skill call: `/eventstorming "..."`

### Generated Code Has Errors

1. Run `pnpm type-check`
2. Check imports are correct
3. Verify DI symbols are registered

### Tests Failing

1. Check mock setup matches interface
2. Verify DI module registration
3. Run single test: `pnpm test -- path/to/test.ts`

## Next Steps

- **[Tutorial](./03-tutorial-first-feature.md)** - See workflow in action
- **[Architecture](./02-architecture.md)** - Understand the patterns
- **[Deployment](./05-deployment.md)** - Go to production
