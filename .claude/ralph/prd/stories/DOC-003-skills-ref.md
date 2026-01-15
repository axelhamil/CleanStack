# DOC-003: Skills Reference Section

## Story

**As a** developer
**I want** a skills reference in CLAUDE.md
**So that** I know what skills are available

## Acceptance Criteria

- [ ] List all skills
- [ ] Usage syntax for each
- [ ] Example for each
- [ ] When to use each

## Content

```markdown
## Skills Reference

### /eventstorming
**Purpose:** Discover domain events interactively

**Usage:**
\`\`\`
/eventstorming
\`\`\`

**Output:** YAML with events, commands, aggregates, policies

**Example:**
\`\`\`
User: /eventstorming
Claude: What feature are you building?
User: User notifications
Claude: [Guides through discovery]
→ Output: YAML specification
\`\`\`

---

### /feature-prd
**Purpose:** Generate PRD from EventStorming output

**Usage:**
\`\`\`
/feature-prd [EventStorming YAML or description]
\`\`\`

**Output:** Markdown PRD with domain model, use cases, API

**Example:**
\`\`\`
/feature-prd
feature: Notifications
aggregates:
  - name: Notification
    events: [NotificationCreated, NotificationRead]
\`\`\`

---

### /gen-domain
**Purpose:** Generate domain layer code

**Usage:**
\`\`\`
/gen-domain [Aggregate] with [properties]
\`\`\`

**Output:** Aggregate, VOs, Events files

**Example:**
\`\`\`
/gen-domain Notification with userId, type, message, readAt
\`\`\`

---

### /gen-usecase
**Purpose:** Generate use case with DTOs and DI

**Usage:**
\`\`\`
/gen-usecase [UseCaseName]: [description]
\`\`\`

**Output:** UseCase, DTOs, DI registration

**Example:**
\`\`\`
/gen-usecase MarkNotificationRead: marks a notification as read for user
\`\`\`

---

### /gen-tests
**Purpose:** Generate BDD tests for use case

**Usage:**
\`\`\`
/gen-tests [UseCaseName]
\`\`\`

**Output:** Comprehensive test file

**Example:**
\`\`\`
/gen-tests MarkNotificationReadUseCase
\`\`\`
```

## Definition of Done

- [ ] Section written
- [ ] All skills documented
- [ ] Examples clear
