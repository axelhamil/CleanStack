@plan.md @activity.md

We are implementing the LLM Module Plug & Play feature in this repo.

**PRD Reference:** `.claude/ralph/PRD.md`

First read activity.md to see what was recently accomplished.

Start the dev server with `pnpm dev` (keep localhost only).

Open plan.md and choose the single highest priority task where passes is false.

Work on exactly ONE task: implement the change.

## Key Patterns to Follow

Reference these existing implementations:
- **Aggregate pattern:** `src/domain/user/user.aggregate.ts`
- **Value Object pattern:** `src/domain/user/value-objects/email.vo.ts`
- **Use Case pattern:** `src/application/use-cases/auth/sign-in.use-case.ts`
- **Repository pattern:** `src/adapters/repositories/user.repository.ts`
- **DI module pattern:** `common/di/modules/auth.module.ts`

### Mandatory Rules
1. **Never throw exceptions** - use `Result<T>` for fallible operations
2. **Never use null** - use `Option<T>` for optional values
3. **Value Objects use Zod** for validation
4. **Events dispatched AFTER repository save**
5. **No index.ts barrels** - import directly
6. **No comments** - self-documenting code

## After Implementing

`pnpm check:all` pour tout check.

1. Run `pnpm type-check` to verify types
2. Run `pnpm test` if tests exist for the feature
3. Verify in browser if UI changes
4. Take screenshot if visual change (save to screenshots/)

Append a dated progress entry to activity.md describing:
- What you changed
- Which commands you ran
- What you verified

Update that task's passes in plan.md from false to true.

Make one git commit for that task only with a clear message format:
```
feat(llm): [task description]
```

## ACCEPTANCE CRITERIA (MANDATORY)

Before marking any task as complete, ensure these criteria are on track:

1. **All tests written and passing** - Every domain entity, VO, aggregate, and use case MUST have tests
2. **`pnpm check:all` passes** - No linting errors, no type errors, all tests green
3. **Test coverage >= 90%** - Run `pnpm test:coverage` to verify
4. **`pnpm check:duplication` passes** - No duplicated code
5. **`pnpm check:unused` passes** - No dead code

## Do NOT

- Run git init
- Change git remotes
- Run git push
- Work on multiple tasks at once
- Skip type-check verification
- Forget to update activity.md
- Skip writing tests for any code you create
- Leave coverage below 90%

## Important Dependencies

- AI SDK Vercel: `pnpm add ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google`
- Charts (optional): Use shadcn charts or recharts

## ONLY WORK ON A SINGLE TASK.

When ALL tasks have passes true, output <promise>COMPLETE</promise>
