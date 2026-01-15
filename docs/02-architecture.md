# Architecture

This boilerplate uses **Clean Architecture** with **Domain-Driven Design** principles.

## The Layers

```
┌─────────────────────────────────────────────────┐
│              Presentation (app/)                │
│           Pages, Components, API Routes         │
├─────────────────────────────────────────────────┤
│            Adapters (src/adapters/)             │
│    Controllers, Repositories, Services, DI     │
├─────────────────────────────────────────────────┤
│          Application (src/application/)         │
│       Use Cases, DTOs, Ports (interfaces)       │
├─────────────────────────────────────────────────┤
│              Domain (src/domain/)               │
│     Entities, Value Objects, Domain Events      │
└─────────────────────────────────────────────────┘
```

### Domain Layer (Core)

The innermost layer. Contains business logic with **zero external dependencies**.

```
src/domain/
├── user/
│   ├── user.aggregate.ts       # User aggregate root
│   ├── user-id.vo.ts           # User ID value object
│   ├── email.vo.ts             # Email value object
│   ├── password.vo.ts          # Password value object
│   └── events/                 # Domain events
│       ├── user-created.event.ts
│       └── user-email-verified.event.ts
└── billing/
    ├── subscription.aggregate.ts
    └── ...
```

### Application Layer

Orchestrates use cases. Defines **ports** (interfaces) for external services.

```
src/application/
├── use-cases/
│   └── auth/
│       ├── sign-in.use-case.ts
│       ├── sign-up.use-case.ts
│       └── get-session.use-case.ts
├── ports/
│   ├── i-user-repository.ts    # Repository interface
│   └── i-auth-provider.ts      # Auth provider interface
└── dto/
    └── auth/
        ├── sign-in.dto.ts
        └── sign-up.dto.ts
```

### Adapters Layer

Implements ports. Connects to external systems.

```
src/adapters/
├── repositories/               # Database implementations
│   └── drizzle-user.repository.ts
├── auth/                       # Auth provider implementation
│   └── better-auth.service.ts
├── controllers/                # HTTP handlers
├── guards/                     # Auth middleware
├── mappers/                    # Domain <-> DB mapping
└── queries/                    # Read-only queries (CQRS)
```

### Presentation Layer

Next.js pages and components. Thin layer that delegates to adapters.

```
app/
├── (auth)/
│   ├── login/
│   └── signup/
├── (protected)/
│   ├── dashboard/
│   └── settings/
└── api/
    └── auth/[...all]/          # BetterAuth API routes
```

## Key Concepts

### Result<T> - Explicit Error Handling

No exceptions. Every operation returns a `Result`.

```typescript
const result = await userRepo.findByEmail(email);

if (result.isFailure) {
  console.error(result.getError());
  return;
}

const userOption = result.getValue();
```

**Why?**
- TypeScript knows all possible states
- No hidden throws
- Composable with `Result.combine([r1, r2])`

### Option<T> - No Null Checks

No null or undefined. Use `Option` for optional values.

```typescript
const userOption = await repo.findById(id);

match(userOption, {
  Some: (user) => console.log(user.email),
  None: () => console.log("User not found"),
});

// Or with defaults
const name = userOption.map(u => u.name).unwrapOr("Anonymous");
```

**Why?**
- Explicit handling of missing values
- No `if (user !== null)` checks
- Pattern matching

### Value Objects - Validated Data

Domain primitives that validate themselves.

```typescript
// Creating a value object
const emailResult = Email.create("test@example.com");

if (emailResult.isFailure) {
  // "Invalid email format"
  return emailResult;
}

const email = emailResult.getValue();
console.log(email.value); // "test@example.com"
```

**Why?**
- Validation at construction
- Invalid states are impossible
- Reusable validation logic

### Aggregates - Consistency Boundaries

Entities that maintain invariants and emit domain events.

```typescript
class User extends Aggregate<IUserProps> {
  verifyEmail(): void {
    this._props.emailVerified = true;
    this._props.updatedAt = new Date();
    this.addEvent(new UserEmailVerifiedEvent({ userId: this.id.value }));
  }
}

// Domain events are collected, then dispatched after save
user.verifyEmail();
await userRepo.update(user);
await eventDispatcher.dispatch(user.domainEvents);
```

### Use Cases - Single Responsibility

One class, one business operation.

```typescript
export class SignInUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // 1. Validate input (create VOs)
    // 2. Business logic
    // 3. Return Result
  }
}
```

### Dependency Injection

All dependencies are injected. No hardcoded imports.

```typescript
// Getting a use case
const signInUseCase = getInjection("SignInUseCase");
const result = await signInUseCase.execute(input);
```

**Configuration in `common/di/`:**

```typescript
// modules/auth.module.ts
export const createAuthModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.IUserRepository).toClass(DrizzleUserRepository);
  m.bind(DI_SYMBOLS.SignInUseCase).toClass(SignInUseCase, [
    DI_SYMBOLS.IUserRepository,
    DI_SYMBOLS.IAuthProvider,
  ]);
  return m;
};
```

## Data Flow

### Command Flow (Write Operations)

```
Page/API → Controller → Use Case → Domain → Repository
                                     ↓
                              Domain Events
```

### Query Flow (Read Operations)

```
Page/API → Query → Database (direct ORM)
```

CQRS separates reads from writes:
- **Commands**: Go through Use Cases, maintain consistency
- **Queries**: Direct database access, optimized for reads

## Reference Implementation

Study the auth feature as a complete example:

| Layer | Files |
|-------|-------|
| Domain | `src/domain/user/` |
| Application | `src/application/use-cases/auth/` |
| Ports | `src/application/ports/` |
| Adapters | `src/adapters/auth/`, `src/adapters/repositories/` |
| Presentation | `app/(auth)/`, `app/(protected)/` |

## Next Steps

- **[Build Your First Feature](./03-tutorial-first-feature.md)** - Apply these concepts
- **[AI Workflow](./04-ai-workflow.md)** - Generate code following this architecture
