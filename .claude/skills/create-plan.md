---
name: create-plan
description: Generate plan.md and PROMPT.md for Ralph Wiggum autonomous workflow
---

# Create Implementation Plan

Generate structured task files for running autonomous agent loops (Ralph Wiggum workflow). Creates both `plan.md` (task list) and `PROMPT.md` (agent instructions).

## Prerequisites

Before using this skill:
1. Have a PRD ready (use `/feature-prd` first)
2. Understand the feature scope and implementation order
3. Have the project set up with proper sandboxing

## How to Start

Ask: "What feature are you implementing? Point me to your PRD or describe the scope."

## Input

Expects one of:
1. Reference to a PRD file (`PRD.md` or feature description)
2. Direct description of the implementation scope
3. List of tasks to organize

## Task Categories

Organize tasks into these categories (TDD order):

| Category | Description | Examples |
|----------|-------------|----------|
| `setup` | Project initialization, deps, config | Create directories, install packages |
| `domain-tests` | Domain layer tests (write FIRST) | Aggregate tests, VO tests, Event tests |
| `domain` | Domain layer implementation | Aggregates, VOs, Events |
| `application-tests` | Application layer tests (write FIRST) | Use case tests, BDD tests |
| `application` | Application layer implementation | Use cases, DTOs, Ports |
| `infrastructure` | Infrastructure setup | DB schema, DI bindings |
| `adapters` | Adapters layer implementation | Repositories, Mappers, Controllers |
| `ui` | Frontend components and pages | Components, pages, layouts |
| `verification` | Final validation | Build, lint, E2E checks |

## Task Structure

Each task must have:
- **category**: One of the categories above
- **description**: Clear, concise task summary
- **steps**: Specific actionable steps (3-7 per task)
- **passes**: Always starts as `false`

## Output Files

### 1. plan.md

```markdown
# Implementation Plan: [Feature Name]

## Overview
[Brief description of what's being built]

**Reference:** `PRD.md`
**Estimated Tasks:** [N]

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Initialize project structure",
    "steps": [
      "Create feature directories in src/domain/[feature]/",
      "Create feature directories in src/domain/[feature]/__tests__/",
      "Create feature directories in src/application/use-cases/[feature]/",
      "Create feature directories in src/application/use-cases/[feature]/__tests__/",
      "Verify project compiles with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain-tests",
    "description": "Write [Aggregate] aggregate tests (TDD - tests first)",
    "steps": [
      "Create __tests__/[aggregate].aggregate.test.ts",
      "Write tests for aggregate creation with valid props",
      "Write tests for aggregate creation with invalid props",
      "Write tests for domain event emission",
      "Run pnpm test (tests should fail - no implementation yet)"
    ],
    "passes": false
  },
  {
    "category": "domain-tests",
    "description": "Write value object tests (TDD - tests first)",
    "steps": [
      "Create __tests__/[vo-name].vo.test.ts",
      "Write tests for valid value creation",
      "Write tests for invalid value rejection",
      "Write tests for edge cases",
      "Run pnpm test (tests should fail - no implementation yet)"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement [Aggregate] aggregate",
    "steps": [
      "Create [Aggregate]Id class",
      "Create [Aggregate] aggregate with properties",
      "Create static create() and reconstitute() methods",
      "Run pnpm test (domain tests should now pass)"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement value objects",
    "steps": [
      "Create [VOName] value object with Zod validation",
      "Add validation rules per PRD spec",
      "Run pnpm test (VO tests should now pass)"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement domain events",
    "steps": [
      "Create [EventName]Event class",
      "Define event payload interface",
      "Add event emission in aggregate methods",
      "Run pnpm test (all domain tests should pass)"
    ],
    "passes": false
  },
  {
    "category": "application-tests",
    "description": "Write [UseCaseName] use case tests (TDD - tests first)",
    "steps": [
      "Create __tests__/[use-case-name].use-case.test.ts",
      "Mock repository and event dispatcher",
      "Write happy path tests",
      "Write validation error tests",
      "Write business rule tests",
      "Run pnpm test (tests should fail - no implementation yet)"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement [UseCaseName] use case",
    "steps": [
      "Create input/output DTOs with Zod schemas",
      "Create use case class with DI",
      "Implement execute() method",
      "Add event dispatch after repository save",
      "Run pnpm test (use case tests should now pass)"
    ],
    "passes": false
  },
  {
    "category": "infrastructure",
    "description": "Add database schema",
    "steps": [
      "Create schema in packages/drizzle/schema/",
      "Add relations if needed",
      "Run pnpm db:push to apply",
      "Verify schema applied correctly"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement repository",
    "steps": [
      "Create I[Aggregate]Repository port interface",
      "Create Drizzle[Aggregate]Repository implementation",
      "Create [Aggregate]Mapper for domain<->db conversion",
      "Register in DI module"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create [PageName] page",
    "steps": [
      "Create page.tsx at app/[route]/",
      "Create components in _components/",
      "Add server actions if needed",
      "Verify page renders correctly"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Final validation",
    "steps": [
      "Run pnpm check:all",
      "Fix any linting issues",
      "Fix any type errors",
      "Verify all tests pass",
      "Test feature manually in browser"
    ],
    "passes": false
  }
]
```

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find the next task with `"passes": false`
3. Complete all steps for that task
4. Verify the change works (type-check, tests, browser)
5. Update the task to `"passes": true`
6. Log completion in `activity.md`
7. Make one git commit for that task only
8. Repeat until all tasks pass

**Important:**
- Only modify the `passes` field. Do not remove or rewrite tasks.
- Work on exactly ONE task at a time
- Commit after each completed task
- Do not run git push

---

## Completion Criteria

All tasks marked with `"passes": true`
```

### 2. PROMPT.md

```markdown
@plan.md @activity.md

We are implementing [Feature Name] in this repo.

First read activity.md to see what was recently accomplished.

Start the dev server with `pnpm dev` (keep localhost only).

Open plan.md and choose the single highest priority task where passes is false.

Work on exactly ONE task: implement the change.

After implementing:
1. Run `pnpm type-check` to verify types
2. Run `pnpm test` if tests exist for the feature
3. Verify in browser if UI changes
4. Take screenshot if visual change (save to screenshots/)

Append a dated progress entry to activity.md describing:
- What you changed
- Which commands you ran
- What you verified

Update that task's passes in plan.md from false to true.

Make one git commit for that task only with a clear message.

Do NOT:
- Run git init
- Change git remotes
- Run git push
- Work on multiple tasks at once

ONLY WORK ON A SINGLE TASK.

When ALL tasks have passes true, output <promise>COMPLETE</promise>
```

---

## Guidelines

### Task Sizing
- Each task should take 5-15 minutes to complete
- Break large tasks into smaller ones
- Each task should be independently verifiable

### Task Order (TDD)
1. Setup (directories, config)
2. Domain Tests (write failing tests FIRST)
3. Domain Implementation (make tests pass)
4. Application Tests (write failing tests FIRST)
5. Application Implementation (make tests pass)
6. Infrastructure (DB schema, DI bindings)
7. Adapters layer (repositories, mappers)
8. UI components and pages
9. Final verification

### Dependencies
- Tasks within a category can often run in parallel
- Domain must complete before Application
- Application must complete before Adapters
- Adapters must complete before UI (for server actions)

---

## Example

For a "Bookmark" feature with PRD (TDD workflow):

```json
[
  {
    "category": "setup",
    "description": "Create bookmark feature directories",
    "steps": [
      "Create src/domain/bookmark/",
      "Create src/domain/bookmark/__tests__/",
      "Create src/domain/bookmark/value-objects/",
      "Create src/domain/bookmark/events/",
      "Create src/application/use-cases/bookmark/",
      "Create src/application/use-cases/bookmark/__tests__/",
      "Create src/application/dto/bookmark/"
    ],
    "passes": false
  },
  {
    "category": "domain-tests",
    "description": "Write Bookmark aggregate tests (TDD - tests first)",
    "steps": [
      "Create __tests__/bookmark.aggregate.test.ts",
      "Write tests for Bookmark.create() with valid props",
      "Write tests for Bookmark.create() emitting BookmarkCreatedEvent",
      "Write tests for Bookmark.reconstitute()",
      "Run pnpm test (tests should fail - no implementation yet)"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement Bookmark aggregate",
    "steps": [
      "Create BookmarkId in bookmark.id.ts",
      "Create Bookmark aggregate with userId, articleId, createdAt",
      "Add static create() method that emits BookmarkCreatedEvent",
      "Add static reconstitute() method",
      "Run pnpm test (aggregate tests should now pass)"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement BookmarkCreatedEvent",
    "steps": [
      "Create events/bookmark-created.event.ts",
      "Define payload: bookmarkId, userId, articleId, createdAt",
      "Extend BaseDomainEvent",
      "Run pnpm test (all domain tests should pass)"
    ],
    "passes": false
  },
  {
    "category": "application-tests",
    "description": "Write CreateBookmarkUseCase tests (TDD - tests first)",
    "steps": [
      "Create __tests__/create-bookmark.use-case.test.ts",
      "Mock IBookmarkRepository and IEventDispatcher",
      "Write test for successful bookmark creation",
      "Write test for duplicate bookmark error",
      "Write test for event dispatch verification",
      "Run pnpm test (tests should fail - no implementation yet)"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement CreateBookmarkUseCase",
    "steps": [
      "Create create-bookmark.dto.ts with input/output schemas",
      "Create IBookmarkRepository port interface",
      "Create CreateBookmarkUseCase with execute()",
      "Dispatch events after successful save",
      "Run pnpm test (use case tests should now pass)"
    ],
    "passes": false
  },
  {
    "category": "infrastructure",
    "description": "Add bookmark database schema",
    "steps": [
      "Create packages/drizzle/schema/bookmark.ts",
      "Define bookmark table with userId, articleId, createdAt",
      "Add unique constraint on userId+articleId",
      "Run pnpm db:push"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement DrizzleBookmarkRepository",
    "steps": [
      "Create BookmarkMapper for domain<->db",
      "Create DrizzleBookmarkRepository",
      "Implement create, delete, findByUser methods",
      "Register in DI module"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Final bookmark feature validation",
    "steps": [
      "Run pnpm check:all",
      "Ensure all tests pass",
      "Verify types with pnpm type-check",
      "Manual test in browser"
    ],
    "passes": false
  }
]
```

---

## Next Steps

After creating plan.md and PROMPT.md:
1. Create `activity.md` with `/create-activity`
2. Run Ralph Wiggum: `./ralph.sh 20` or use the plugin `/ralph`
3. Monitor progress in activity.md and git log
