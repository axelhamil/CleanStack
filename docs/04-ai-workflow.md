# AI Workflow

This boilerplate is optimized for AI-assisted development with Claude.

## Overview

The AI workflow accelerates development while maintaining architectural consistency:

```
New Feature Request
       │
       ▼
┌──────────────┐
│  Feature PRD │ → Conversational PRD + EventStorming
└──────────────┘
       │
       ▼
┌──────────────┐
│  Create Plan │ → Generate plan.md + PROMPT.md
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

---

## Skills Reference

| Skill | Purpose | Example |
|-------|---------|---------|
| `/feature-prd` | Conversational PRD with EventStorming discovery | `/feature-prd` |
| `/create-plan` | Generate plan.md + PROMPT.md for autonomous workflow | `/create-plan` |
| `/create-activity` | Initialize activity.md for session logging | `/create-activity` |
| `/gen-domain` | Create aggregate, VOs, events | `/gen-domain Invoice` |
| `/gen-usecase` | Create use case, DTO, port | `/gen-usecase SendInvoice` |
| `/gen-tests` | Generate BDD tests for use case | `/gen-tests SendInvoiceUseCase` |

### /feature-prd

Start here for new features. Guides you through domain discovery and requirements.

**Process:**
1. **EventStorming Discovery** - Domain Events, Commands, Aggregates, Policies
2. **Feature Deep Dive** - 10 essential aspects (audience, platform, data, auth, etc.)
3. **Technology Discussion** - Research and recommendations
4. **PRD Generation** - Comprehensive implementation-ready document

**How to use:**
```
/feature-prd
```

Claude will ask questions to understand your feature before generating the PRD.

**Output:**
- Domain model specification
- Use case definitions with DTOs
- API endpoints
- Event handlers
- Implementation checklist with file locations

### /create-plan

Generates `plan.md` and `PROMPT.md` for autonomous agent loops (Ralph Wiggum workflow).

**Input:**
```
/create-plan
```

**Output: plan.md**
```markdown
# Implementation Plan: [Feature Name]

## Task List

```json
[
  {
    "category": "setup",
    "description": "Create feature directories",
    "steps": ["Create src/domain/feature/", "..."],
    "passes": false
  }
]
```
```

**Output: PROMPT.md**
```markdown
@plan.md @activity.md

We are implementing [Feature] in this repo.
Read activity.md first, then find the next task with passes: false...
```

### /create-activity

Initializes `activity.md` for tracking agent progress during autonomous loops.

**Input:**
```
/create-activity
```

**Output: activity.md**
```markdown
# [Feature] - Activity Log

## Current Status
**Tasks Completed:** 0/[total]
**Current Task:** [next task]

## Session Log
<!-- Agent appends entries here -->
```

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
src/application/use-cases/subscription/__tests__/
└── create-subscription.use-case.test.ts
```

---

## Ralph Wiggum Workflow

For complex features, use the autonomous agent loop:

### Setup

1. **Create PRD**: `/feature-prd` → Generate comprehensive requirements
2. **Create Plan**: `/create-plan` → Generate `plan.md` and `PROMPT.md`
3. **Create Activity Log**: `/create-activity` → Initialize `activity.md`

### Execution

The agent loop works as follows:

```
┌─────────────────────────────────┐
│    Read activity.md (state)     │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│   Find next task in plan.md    │
│        (passes: false)         │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│     Complete task steps         │
│   - Implement code              │
│   - Run type-check              │
│   - Verify in browser           │
└─────────────────┬───────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│   Update plan.md (passes: true) │
│   Log in activity.md            │
│   Git commit                    │
└─────────────────┬───────────────┘
                  │
                  ▼
            ┌─────────┐
            │ Repeat  │
            └─────────┘
```

### Status Icons

| Icon | Meaning |
|------|---------|
| ⏳ | Pending |
| 🔄 | In Progress |
| ✅ | Complete |
| ❌ | Failed |
| ⚠️ | Blocked |

---

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

**Output:**
- File structure proposal
- Implementation order
- Dependency mapping

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

**Output:**
```markdown
## Review Summary

### Issues by Severity
- CRITICAL: 0
- ERROR: 2
- WARNING: 3

### Top Priorities
1. Fix domain layer import violation
2. Add Result return type to method
```

### test-writer

Generates comprehensive BDD tests.

**Triggers on:**
- After UseCase creation
- When asked for tests

**Test Categories:**
- Happy path
- Validation errors
- Business rules
- Error handling
- Event emission

### doc-writer

Updates documentation to match code.

**Triggers on:**
- Before release
- When docs are outdated

---

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

---

## Common Workflows

### Adding a New Feature (Interactive)

```
1. /feature-prd                    # Conversational discovery
2. /gen-domain AggregateName       # Generate domain layer
3. /gen-usecase UseCase1           # Generate use cases
4. Implement repository
5. Create UI
6. /gen-tests                      # Generate tests
7. Commit
```

### Adding a New Feature (Autonomous)

```
1. /feature-prd                    # Generate PRD
2. /create-plan                    # Generate plan.md + PROMPT.md
3. /create-activity                # Initialize activity.md
4. Run autonomous loop             # Agent executes tasks
5. Review and merge
```

### Adding a Single Use Case

```
1. /gen-usecase UseCaseName
2. Implement repository if needed
3. /gen-tests UseCaseNameUseCase
4. Commit: feat(feature): add use case
```

---

## Troubleshooting

### Skills Not Working

1. Check `CLAUDE.md` is in project root
2. Verify `.claude/skills/` directory exists
3. Try explicit skill call: `/feature-prd`

### Generated Code Has Errors

1. Run `pnpm type-check`
2. Check imports are correct
3. Verify DI symbols are registered

### Tests Failing

1. Check mock setup matches interface
2. Verify DI module registration
3. Run single test: `pnpm test -- path/to/test.ts`

---

## Next Steps

- **[Tutorial](./03-tutorial-first-feature.md)** - See workflow in action
- **[Core Concepts](./08-core-concepts.md)** - DDD patterns
- **[Testing](./09-testing.md)** - BDD testing guide
- **[Deployment](./05-deployment.md)** - Go to production
