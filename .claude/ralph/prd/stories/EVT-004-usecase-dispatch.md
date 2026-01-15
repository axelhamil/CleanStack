# EVT-004: UseCase Event Dispatch

## Story

**As a** developer
**I want** events dispatched after repository save
**So that** side effects run only on successful persistence

## Acceptance Criteria

- [ ] Events dispatched AFTER `repository.save()` succeeds
- [ ] Events collected from aggregate
- [ ] Aggregate events cleared after dispatch
- [ ] Pattern documented in CLAUDE.md

## Technical Notes

### Pattern: Dispatch After Save

```typescript
// src/application/use-cases/auth/sign-up.use-case.ts
export class SignUpUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
    private readonly eventDispatcher: IEventDispatcher, // Injected
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // 1. Create aggregate (adds events internally)
    const user = User.create({
      email: emailVo,
      name: nameVo,
    });
    // User.create() internally calls: this.addEvent(new UserCreatedEvent(...))

    // 2. Persist
    const saveResult = await this.userRepo.create(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    // 3. Dispatch events AFTER successful save
    await this.eventDispatcher.dispatchAll(user.domainEvents);
    user.clearEvents();

    // 4. Return result
    return Result.ok(this.toDto(user));
  }
}
```

### Alternative: Repository Dispatches

```typescript
// If you prefer the repository to handle dispatch:
export class DrizzleUserRepository implements IUserRepository {
  constructor(
    private readonly db: Database,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async create(user: User, trx?: Transaction): Promise<Result<User>> {
    const result = await this.db.insert(users).values(toDb(user));
    if (result.isFailure) return result;

    // Dispatch after successful insert
    await this.eventDispatcher.dispatchAll(user.domainEvents);
    user.clearEvents();

    return Result.ok(user);
  }
}
```

### Recommended: UseCase Approach

UseCase approach is preferred because:
1. Explicit control over when events fire
2. Can batch multiple operations before dispatch
3. Easier to test
4. Transaction boundaries clearer

## Definition of Done

- [ ] Pattern implemented in SignUpUseCase
- [ ] Pattern documented
- [ ] Tests verify events dispatched
