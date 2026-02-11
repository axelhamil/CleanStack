---
name: resume
description: Resume autonomous workflow after failure - checkpoint-based recovery for Ralph Wiggum loops
---

# Resume Workflow

Resume an interrupted autonomous workflow (Ralph Wiggum loop) from the last successful checkpoint. Reads `activity.md` to understand state and continues from where things stopped.

## When to Use

- After a workflow failure (tests failed, build error, etc.)
- When resuming after a break
- When picking up work in a new session
- When context was lost

## How It Works

```
/resume
    │
    ├─► Read activity.md (understand state)
    │
    ├─► Read plan.md (find incomplete tasks)
    │
    ├─► Identify last completed task
    │
    ├─► Diagnose why workflow stopped
    │
    └─► Continue from next incomplete task
```

## Input

No input required. Reads from:
- `activity.md` - Session log and current state
- `plan.md` - Task list with passes: true/false

## Process

### 1. Analyze Current State

Read `activity.md` to understand:
- What was the last task attempted?
- What was the outcome (success/failure)?
- What errors were encountered?
- What commands were run?

### 2. Diagnose Issues (if failure)

If the last task failed, analyze:
- Was it a test failure? → Read failing tests
- Was it a type error? → Run `pnpm type-check`
- Was it a lint error? → Run `pnpm check`
- Was it a build error? → Read error output

### 3. Recovery Strategies

#### Test Failure
```bash
# Identify failing tests
pnpm test --reporter=verbose

# Common fixes:
# - Missing mock setup
# - Incorrect assertions
# - Missing implementation
```

#### Type Error
```bash
# Get detailed type errors
pnpm type-check

# Common fixes:
# - Missing imports
# - Incorrect types in DTOs
# - Missing interface implementations
```

#### Lint Error
```bash
# Auto-fix what's possible
pnpm fix

# Then check remaining
pnpm check
```

#### Build Error
```bash
# Check build output
pnpm build

# Common fixes:
# - Missing environment variables
# - Import path issues
# - Missing dependencies
```

### 4. Fix and Continue

After fixing the issue:
1. Verify the fix works (run relevant check)
2. Update `activity.md` with the fix
3. Mark task as complete in `plan.md` if done
4. Continue to next task

## Recovery Patterns

### Pattern 1: Test Failure → Fix → Continue

```markdown
## Last attempt (from activity.md)
Task: Write CreateBookmark use case tests
Status: ❌ Failed
Error: Cannot find module '@/domain/bookmark/bookmark.aggregate'

## Diagnosis
The aggregate wasn't implemented yet (TDD - expected to fail at this point).
But we're in the wrong phase - should have written tests first.

## Resolution
1. Verify we're in correct TDD phase
2. Check if previous tasks (domain implementation) are complete
3. If domain isn't done, go back and complete it first
4. Re-run tests after domain is implemented
```

### Pattern 2: Missing Dependency → Install → Continue

```markdown
## Last attempt
Task: Implement repository
Status: ❌ Failed
Error: Module not found: packages/drizzle

## Diagnosis
Package not installed or not built.

## Resolution
1. pnpm install
2. cd packages/drizzle && pnpm build
3. Re-run the task
```

### Pattern 3: Schema Not Pushed → Push → Continue

```markdown
## Last attempt
Task: Implement repository
Status: ❌ Failed
Error: relation "bookmarks" does not exist

## Diagnosis
Database schema wasn't pushed.

## Resolution
1. pnpm db:push
2. Verify schema exists
3. Re-run the task
```

### Pattern 4: DI Not Registered → Register → Continue

```markdown
## Last attempt
Task: Test server actions
Status: ❌ Failed
Error: No binding found for Symbol(CreateBookmarkUseCase)

## Diagnosis
Use case not registered in DI container.

## Resolution
1. Add binding to common/di/modules/{feature}.module.ts
2. Load module in container.ts
3. Re-run the task
```

## Activity Log Update Format

When resuming, add an entry:

```markdown
### [Date Time] - Resume from failure

**Previous Task:** [Task that failed]
**Failure Reason:** [Error description]

**Diagnosis:**
- [What went wrong]
- [Root cause identified]

**Resolution:**
- [Fix applied]
- [Commands run]
- [Verification performed]

**Status:** 🔄 Resuming from [next task]

---
```

## Checkpoint Strategy

The workflow creates implicit checkpoints:
- Each task completion = checkpoint
- Each git commit = checkpoint
- Each test pass = checkpoint

To resume:
1. Find last completed task (passes: true)
2. Find next incomplete task (passes: false)
3. Verify prerequisites are met
4. Continue from there

## Common Recovery Scenarios

### Scenario 1: Session Timeout

```
User: /resume

Claude: Reading activity.md...

Last session ended at task 5/12: "Implement Repository"
Status: ✅ Complete

Next task: 6/12 "Create Server Actions"
Prerequisites: ✅ Repository implemented, ✅ Use cases ready

Continuing from task 6...
```

### Scenario 2: Test Failure

```
User: /resume

Claude: Reading activity.md...

Last task: "Write CreateBookmark tests"
Status: ❌ Failed
Error: AssertionError - expected true to be false

Analyzing test failure...
The test expects repository.create to return Result.ok(),
but mock wasn't configured.

Fixing mock setup...
[Applies fix]

Re-running tests...
✅ Tests now pass

Marking task complete and continuing...
```

### Scenario 3: Partial Completion

```
User: /resume

Claude: Reading activity.md...

Last task: "Implement UI components"
Status: 🔄 In Progress (partial)

Completed:
- ✅ BookmarkList component
- ✅ BookmarkCard component
- ⏳ BookmarkForm component (not started)

Continuing with BookmarkForm...
```

## Integration with Plan

The `/resume` skill works with the plan structure:

```json
{
  "tasks": [
    { "description": "Task 1", "passes": true },   // ✅ Done
    { "description": "Task 2", "passes": true },   // ✅ Done
    { "description": "Task 3", "passes": false },  // 📍 Resume here
    { "description": "Task 4", "passes": false }   // ⏳ Pending
  ]
}
```

## Best Practices

1. **Don't skip tasks** - If a task failed, fix it before moving on
2. **Verify prerequisites** - Ensure earlier tasks are truly complete
3. **Update activity.md** - Document the resume and any fixes
4. **Commit after fix** - Create checkpoint for future resumes
5. **Run validation** - `pnpm check:all` after significant fixes

## Example Session

```
User: /resume

Claude: Let me check the current state...

📖 Reading activity.md...
Last update: 2024-01-15 14:32
Last task: "Implement CreateBookmarkUseCase"
Status: ❌ Failed

📖 Reading plan.md...
Completed: 5/12 tasks
Current: Task 6 - "Implement CreateBookmarkUseCase"

🔍 Analyzing failure...
Error: Type 'Result<Bookmark>' is not assignable to type 'Result<ICreateBookmarkOutputDto>'

🔧 Diagnosis:
The use case returns the domain entity instead of mapping to DTO.
Missing `toDto()` call in the execute method.

✅ Fix applied:
Added `return Result.ok(this.toDto(saveResult.getValue()))`

Running verification...
- pnpm type-check ✅
- pnpm test src/application/use-cases/bookmark ✅

📝 Updating activity.md with fix details...
📝 Marking task 6 as complete in plan.md...

Continuing to task 7: "Add database schema"...
```

## Related Commands

- `/create-plan` - Create new plan.md
- `/create-activity` - Create new activity.md
- `/feature` - Start fresh feature development
