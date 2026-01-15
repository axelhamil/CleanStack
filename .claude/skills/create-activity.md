---
name: create-activity
description: Initialize activity.md for session logging in Ralph Wiggum workflow
---

# Create Activity Log

Generate an `activity.md` file for tracking agent progress during autonomous implementation loops (Ralph Wiggum workflow).

## Purpose

The activity log serves as:
1. **State persistence** - Agents read it to understand what was accomplished
2. **Progress tracking** - Humans can monitor what's being done
3. **Debugging** - Identify where things went wrong
4. **Audit trail** - Complete history of implementation

## How to Start

Ask: "What's the project/feature name for this activity log?"

## Input

- Feature or project name
- Reference to plan.md (to count total tasks)

## Output: activity.md

```markdown
# [Feature Name] - Activity Log

## Current Status

**Project:** [Feature Name]
**Started:** [Current Date]
**Last Updated:** [Current Date]
**Tasks Completed:** 0/[Total from plan.md]
**Current Task:** [First task description from plan.md]

---

## Progress Summary

| Category | Status |
|----------|--------|
| Setup | ⏳ Pending |
| Domain | ⏳ Pending |
| Application | ⏳ Pending |
| Adapters | ⏳ Pending |
| Infrastructure | ⏳ Pending |
| UI | ⏳ Pending |
| Testing | ⏳ Pending |
| Verification | ⏳ Pending |

---

## Session Log

<!-- Agent appends dated entries below this line -->

### [Date] - Session Start

**Task:** [First task from plan.md]
**Status:** Starting implementation

---
```

## Entry Format

Each completed task should be logged as:

```markdown
### [Date Time] - [Task Description]

**Category:** [category]
**Status:** ✅ Complete

**Changes Made:**
- [Specific file or change 1]
- [Specific file or change 2]

**Commands Run:**
- `[command 1]`
- `[command 2]`

**Verification:**
- [How it was verified]

**Commit:** `[commit hash or message]`

---
```

## Status Icons

Use these for quick scanning:
- ⏳ Pending
- 🔄 In Progress
- ✅ Complete
- ❌ Failed
- ⚠️ Blocked

## Example Activity Log

```markdown
# Bookmark Feature - Activity Log

## Current Status

**Project:** Bookmark Feature
**Started:** 2024-01-15
**Last Updated:** 2024-01-15 14:32
**Tasks Completed:** 3/8
**Current Task:** Implement CreateBookmarkUseCase

---

## Progress Summary

| Category | Status |
|----------|--------|
| Setup | ✅ Complete |
| Domain | ✅ Complete |
| Application | 🔄 In Progress |
| Adapters | ⏳ Pending |
| Infrastructure | ⏳ Pending |
| UI | ⏳ Pending |
| Testing | ⏳ Pending |
| Verification | ⏳ Pending |

---

## Session Log

### 2024-01-15 14:00 - Create bookmark feature directories

**Category:** setup
**Status:** ✅ Complete

**Changes Made:**
- Created src/domain/bookmark/
- Created src/domain/bookmark/value-objects/
- Created src/domain/bookmark/events/
- Created src/application/use-cases/bookmark/
- Created src/application/dto/bookmark/

**Commands Run:**
- `mkdir -p src/domain/bookmark/{value-objects,events}`
- `mkdir -p src/application/{use-cases,dto}/bookmark`
- `pnpm type-check` ✅

**Verification:**
- Directories exist and project compiles

**Commit:** `feat(bookmark): create feature directory structure`

---

### 2024-01-15 14:15 - Implement Bookmark aggregate

**Category:** domain
**Status:** ✅ Complete

**Changes Made:**
- Created src/domain/bookmark/bookmark.id.ts
- Created src/domain/bookmark/bookmark.aggregate.ts
- Added BookmarkId extends UUID
- Added Bookmark aggregate with create() and reconstitute()

**Commands Run:**
- `pnpm type-check` ✅

**Verification:**
- Types compile correctly
- Aggregate follows project patterns

**Commit:** `feat(bookmark): implement Bookmark aggregate`

---

### 2024-01-15 14:25 - Implement BookmarkCreatedEvent

**Category:** domain
**Status:** ✅ Complete

**Changes Made:**
- Created src/domain/bookmark/events/bookmark-created.event.ts
- Defined IBookmarkCreatedEventPayload interface
- Extended BaseDomainEvent

**Commands Run:**
- `pnpm type-check` ✅

**Verification:**
- Event follows project event pattern
- Aggregate emits event in create() method

**Commit:** `feat(bookmark): add BookmarkCreatedEvent`

---

### 2024-01-15 14:32 - Implement CreateBookmarkUseCase

**Category:** application
**Status:** 🔄 In Progress

**Current Step:** Creating input/output DTOs

---
```

## Guidelines

### When to Update

The agent should update activity.md:
1. At the start of each task (status: In Progress)
2. After completing each task (status: Complete)
3. When encountering errors (status: Failed/Blocked)

### What to Log

- Specific files created or modified
- Commands run with their exit status
- How the change was verified
- Git commit message/hash

### Keeping It Clean

- Use consistent date format: `YYYY-MM-DD HH:MM`
- Keep entries concise but informative
- Update Progress Summary table as tasks complete
- Update "Current Task" in header

---

## Integration with Plan

The activity log works with plan.md:
1. Agent reads activity.md to know current state
2. Agent reads plan.md to find next task
3. Agent completes task and updates plan.md (passes: true)
4. Agent logs completion in activity.md
5. Agent commits both files together

---

## Next Steps

After creating activity.md:
1. Ensure plan.md and PROMPT.md exist
2. Create screenshots/ directory if needed: `mkdir screenshots`
3. Start Ralph Wiggum loop: `./ralph.sh 20`
