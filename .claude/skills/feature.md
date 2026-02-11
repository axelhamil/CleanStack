---
name: feature
description: Generate a complete feature from discovery to validation - the "Lovable with Claude Code" experience
---

# Feature Generator (All-in-One)

Generate a complete feature from high-level description through to working code. This orchestrates the entire development workflow: discovery, domain, application, infrastructure, adapters, UI, and validation.

**Think Lovable, but with full transparency and control.**

## How It Works

```
/feature "Users can bookmark articles"
    │
    ├─► Phase 1: Discovery (conversational)
    │   └─ EventStorming + requirements gathering
    │
    ├─► Phase 2: Domain (TDD)
    │   ├─ Write tests FIRST
    │   └─ Aggregate, VOs, Events
    │
    ├─► Phase 3: Application (TDD)
    │   ├─ Write tests FIRST
    │   └─ Use Cases, DTOs, Ports
    │
    ├─► Phase 4: Infrastructure
    │   ├─ Database schema
    │   └─ DI registration
    │
    ├─► Phase 5: Adapters
    │   ├─ Repository implementation
    │   ├─ Server actions
    │   └─ Event handlers
    │
    ├─► Phase 6: UI
    │   ├─ Pages
    │   ├─ Components
    │   └─ Forms
    │
    └─► Phase 7: Validation
        ├─ pnpm test
        ├─ pnpm type-check
        └─ pnpm check:all
```

## Input

A high-level feature description:
- "Users can bookmark articles"
- "Add a notification system for order updates"
- "Implement user profile settings"

## Output

Complete, working feature code following Clean Architecture + DDD patterns.

---

## Phase 1: Discovery

### Approach
Interactive conversation to understand the feature deeply before writing any code.

### Questions to Ask

**1. Domain Events (Orange)**
"What significant business events happen in this feature? Think in past tense:"
- BookmarkCreated, BookmarkRemoved
- NotificationSent, NotificationRead
- ProfileUpdated, AvatarChanged

**2. Commands (Blue)**
"What actions trigger these events?"
- CreateBookmark → BookmarkCreated
- RemoveBookmark → BookmarkRemoved

**3. Aggregates (Yellow)**
"Which entity owns each event?"
- Bookmark aggregate: BookmarkCreated, BookmarkRemoved
- Notification aggregate: NotificationSent, NotificationRead

**4. Policies (Purple)**
"When [Event] happens, what else should happen automatically?"
- When OrderPlaced → SendOrderConfirmationEmail
- When UserCreated → SendWelcomeEmail

**5. Read Models (Green)**
"What views or queries are needed?"
- UserBookmarks list, BookmarkCount
- NotificationList, UnreadCount

**6. Business Rules**
"What rules must be enforced?"
- User can't bookmark same article twice
- Maximum 100 bookmarks per user

### Deliverable
Summarize understanding and get user confirmation before proceeding.

---

## Phase 2: Domain Layer (TDD)

### 2.1 Write Tests FIRST (Red Phase)

Create test files before implementation:

```typescript
// src/domain/{feature}/__tests__/{feature}.aggregate.test.ts
describe("{Feature} Aggregate", () => {
  describe("create()", () => {
    it("should create with valid props and emit event", () => {
      // Test aggregate creation
    });
  });

  describe("reconstitute()", () => {
    it("should reconstitute without emitting events", () => {
      // Test reconstitution
    });
  });

  describe("domain methods", () => {
    // Test business logic methods
  });
});
```

### 2.2 Run Tests - Should FAIL
```bash
pnpm test src/domain/{feature}
# Expected: Tests fail (no implementation yet)
```

### 2.3 Implement Domain (Green Phase)

Generate using `/gen-domain` pattern:
- `{Feature}Id` - Typed identifier
- `{Feature}` aggregate - Core entity
- Value Objects - Business values with validation
- Domain Events - State change notifications

### 2.4 Run Tests - Should PASS
```bash
pnpm test src/domain/{feature}
# Expected: All tests pass
```

---

## Phase 3: Application Layer (TDD)

### 3.1 Write Tests FIRST (Red Phase)

```typescript
// src/application/use-cases/{feature}/__tests__/{action}.use-case.test.ts
describe("{Action}UseCase", () => {
  describe("execute()", () => {
    describe("Happy Path", () => {
      it("should succeed with valid input", async () => {});
      it("should persist via repository", async () => {});
      it("should dispatch events AFTER save", async () => {});
    });

    describe("Validation Errors", () => {
      it("should fail with invalid input", async () => {});
    });

    describe("Business Rules", () => {
      it("should fail when rule violated", async () => {});
    });

    describe("Error Handling", () => {
      it("should propagate repository errors", async () => {});
    });
  });
});
```

### 3.2 Run Tests - Should FAIL
```bash
pnpm test src/application/use-cases/{feature}
# Expected: Tests fail (no implementation yet)
```

### 3.3 Implement Application (Green Phase)

Generate using `/gen-usecase` pattern:
- Input/Output DTOs with Zod schemas
- Repository Port interface
- Use Case implementation
- DI registration

### 3.4 Run Tests - Should PASS
```bash
pnpm test src/application/use-cases/{feature}
# Expected: All tests pass
```

---

## Phase 4: Infrastructure

### 4.1 Database Schema

```typescript
// packages/drizzle/schema/{feature}.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const {features} = pgTable("{features}", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Other fields...
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

// Export relations if needed
export const {features}Relations = relations({features}, ({ one }) => ({
  user: one(users, {
    fields: [{features}.userId],
    references: [users.id],
  }),
}));
```

### 4.2 Push Schema
```bash
pnpm db:push
```

### 4.3 DI Module

```typescript
// common/di/modules/{feature}.module.ts
import { createModule } from "@evyweb/ioctopus";
import { Drizzle{Feature}Repository } from "@/adapters/repositories/{feature}.repository";
import { Create{Feature}UseCase } from "@/application/use-cases/{feature}/create-{feature}.use-case";
import { DI_SYMBOLS } from "../types";

export const create{Feature}Module = () => {
  const module = createModule();

  module.bind(DI_SYMBOLS.I{Feature}Repository).toClass(Drizzle{Feature}Repository);

  module
    .bind(DI_SYMBOLS.Create{Feature}UseCase)
    .toClass(Create{Feature}UseCase, [
      DI_SYMBOLS.I{Feature}Repository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return module;
};
```

---

## Phase 5: Adapters

### 5.1 Mapper

```typescript
// src/adapters/mappers/{feature}.mapper.ts
export class {Feature}Mapper {
  static toDomain(raw: DbRow): {Feature} {
    return {Feature}.reconstitute(
      {
        // Map fields to domain props
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt ?? undefined,
      },
      {Feature}Id.create(new UUID(raw.id)),
    );
  }

  static toPersistence(entity: {Feature}): DbRow {
    return {
      id: entity.id.value,
      // Map domain props to DB columns
      createdAt: entity.get("createdAt"),
      updatedAt: entity.get("updatedAt") ?? null,
    };
  }
}
```

### 5.2 Repository

Generate using existing repository patterns:
- Implement `I{Feature}Repository` interface
- Use `{Feature}Mapper` for conversions
- Return `Result<T>` for all operations

### 5.3 Server Actions

Generate using `/gen-action` pattern:
- `create{Feature}Action`
- `update{Feature}Action` (if needed)
- `delete{Feature}Action`
- `list{Features}Action` (if paginated list needed)

### 5.4 Event Handlers (if policies defined)

Generate using `/gen-handler` pattern:
- Handlers for each policy from discovery phase

---

## Phase 6: UI

### 6.1 Pages

Generate using `/gen-page` pattern:
- List page (if collection)
- Detail page (if needed)
- Create/Edit page (if forms)

### 6.2 Components

- Server components for data display
- Client components for interactivity

### 6.3 Forms

Generate using `/gen-form` pattern:
- Create form
- Edit form (if needed)
- Delete confirmation (if needed)

---

## Phase 7: Validation

### 7.1 Type Check
```bash
pnpm type-check
# Must pass with no errors
```

### 7.2 All Tests
```bash
pnpm test
# All tests must pass
```

### 7.3 Full Quality Check
```bash
pnpm check:all
# Lint, types, tests, duplication, unused code
```

### 7.4 Manual Verification
- Start dev server: `pnpm dev`
- Test the feature in browser
- Verify all user flows work

---

## Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    /feature "description"                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: DISCOVERY                                          │
│ • EventStorming (Events, Commands, Aggregates, Policies)    │
│ • Business rules identification                              │
│ • Read models needed                                         │
│ → Deliverable: Confirmed understanding                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: DOMAIN (TDD)                                       │
│ • Write aggregate tests FIRST                               │
│ • Write VO tests FIRST                                      │
│ • Run tests (should fail) ✓                                 │
│ • Implement aggregate, VOs, events                          │
│ • Run tests (should pass) ✓                                 │
│ → Files: src/domain/{feature}/                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: APPLICATION (TDD)                                  │
│ • Write use case tests FIRST                                │
│ • Run tests (should fail) ✓                                 │
│ • Implement DTOs, Ports, Use Cases                          │
│ • Run tests (should pass) ✓                                 │
│ → Files: src/application/use-cases/{feature}/               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: INFRASTRUCTURE                                     │
│ • Create database schema                                    │
│ • Run pnpm db:push                                          │
│ • Create DI module                                          │
│ → Files: packages/drizzle/schema/, common/di/modules/       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: ADAPTERS                                           │
│ • Implement Mapper                                          │
│ • Implement Repository                                      │
│ • Create Server Actions                                     │
│ • Create Event Handlers (if policies)                       │
│ → Files: src/adapters/                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: UI                                                 │
│ • Create pages                                              │
│ • Create components                                         │
│ • Create forms                                              │
│ → Files: app/{route}/                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: VALIDATION                                         │
│ • pnpm type-check ✓                                         │
│ • pnpm test ✓                                               │
│ • pnpm check:all ✓                                          │
│ • Manual browser test ✓                                     │
│ → Feature complete!                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Difference from Lovable

| Aspect | Lovable | /feature |
|--------|---------|----------|
| Transparency | Black box | Every step visible |
| Control | Take it or leave it | Intervention at any phase |
| Architecture | Unknown | Clean Architecture + DDD |
| Tests | Maybe | TDD enforced |
| Code quality | Variable | Enforced standards |
| Customization | None | Full control |

---

## Example Session

```
User: /feature "Users can bookmark articles"

Claude: Let's build this feature! First, let me understand the domain.

What business events happen when users bookmark articles?
Think in past tense: BookmarkCreated, BookmarkRemoved...

User: BookmarkCreated, BookmarkRemoved, and users should see their BookmarkList

Claude: Great! What actions trigger these events?
- What action causes BookmarkCreated?

User: When a user clicks the bookmark button on an article page

Claude: Got it! So we have:
- Command: CreateBookmark → BookmarkCreated
- Command: RemoveBookmark → BookmarkRemoved
- Query: GetUserBookmarks → BookmarkList

Any business rules? For example:
- Can a user bookmark the same article twice?
- Is there a maximum number of bookmarks?

User: No duplicates, max 100 bookmarks per user

Claude: Perfect! Let me summarize:

## Bookmark Feature
- **Aggregate:** Bookmark (userId, articleId, createdAt)
- **Events:** BookmarkCreated, BookmarkRemoved
- **Commands:** CreateBookmark, RemoveBookmark
- **Queries:** ListUserBookmarks, GetBookmarkCount
- **Rules:** No duplicates, max 100 per user

Is this correct? Ready to start coding?

User: Yes, let's go!

Claude: Starting Phase 2: Domain Layer (TDD)...

[Proceeds through all phases, showing each step]
```

---

## Fine-Grained Control

For more control, use individual skills:
- `/gen-domain` - Domain layer only
- `/gen-usecase` - Application layer only
- `/gen-action` - Server actions only
- `/gen-route` - API routes only
- `/gen-handler` - Event handlers only
- `/gen-page` - Pages only
- `/gen-form` - Forms only
- `/gen-query` - CQRS queries only

---

## Related Skills

- `/feature-prd` - Generate detailed PRD first (for complex features)
- `/create-plan` - Generate Ralph Wiggum plan for autonomous workflow
- `/create-activity` - Track progress during implementation
