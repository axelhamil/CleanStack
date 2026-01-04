# CLAUDE.md

## Project Overview

Production-ready monorepo boilerplate, optimized for AI and human development through Clean Architecture and DDD. Explicit structure, consistent patterns, self-documenting code.

**Stack**: Next.js 16 (App Router) • Expo (React Native) • TypeScript • Drizzle ORM • PostgreSQL • BetterAuth • Cloudflare R2 • shadcn/ui • Tailwind CSS 4

## Commands

```bash
pnpm dev              # Start dev (runs db:generate first)
pnpm build            # Build all
pnpm type-check       # Type check
pnpm fix              # Auto-fix lint/format
pnpm db               # Start PostgreSQL
pnpm db:push          # Push schema (dev)
pnpm db:generate      # Generate migrations
pnpm test             # Run tests
pnpm ui:add           # Add shadcn component
```

## Architecture

**Clean Architecture with DDD**. All dependencies point INWARD toward Domain.

```
Domain (Core)           → Entities, Value Objects, Aggregates, Events
    ↑
Application             → Use Cases, Ports (interfaces)
    ↑
Adapters                → API Routes, Controllers, Repository implementations
    ↑
Infrastructure          → Database, External APIs, DI config
```

### File Structure

```
apps/nextjs/src/
├── domain/             # Entities, Value Objects, Events
├── application/
│   ├── use-cases/      # Business logic orchestration
│   └── ports/          # Repository interfaces (IXxxRepository)
└── adapters/
    └── out/persistence/ # DrizzleXxxRepository, Mappers
```

## Core Patterns (ddd-kit)

### Result<T> - Never throw exceptions

```typescript
// Use cases and repositories return Result<T>
async execute(input): Promise<Result<User>> {
  const emailOrError = Email.create(input.email)
  if (emailOrError.isFailure) return Result.fail(emailOrError.error)
  return Result.ok(user)
}
```

### Option<T> - No null/undefined

```typescript
// Repositories return Result<Option<T>> for single items
async findById(id): Promise<Result<Option<User>>> {
  if (!row) return Result.ok(None())
  return Result.ok(Some(user))
}
```

### ValueObject<T> - Zod validation

```typescript
export class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = z.email().safeParse(value)
    if (!result.success) return Result.fail(result.error.issues[0]?.message)
    return Result.ok(result.data)
  }
}
// Usage: Email.create("test@example.com") → Result<Email>
```

### Entity/Aggregate - Typed IDs

```typescript
export class UserId extends UUID<string> {
  static create(id: UUID<string>): UserId { return new UserId(id) }
}

export class User extends Aggregate<IUserProps> {
  get id(): UserId { return UserId.create(this._id as UUID<string>) }

  static create(props, id?): Result<User> {
    return Result.ok(new User({ ...props, createdAt: new Date() }, id))
  }
}
```

### Repository Pattern

```typescript
// Port (application/ports/)
export interface IUserRepository extends BaseRepository<User> {
  findByEmail(email: string): Promise<Result<Option<User>>>
}

// Implementation (adapters/out/persistence/)
export class DrizzleUserRepository implements IUserRepository {
  async findById(id, trx?): Promise<Result<Option<User>>> {
    // Always support optional transaction parameter
  }
}
```

### Dependency Injection

```typescript
// Register in common/di/modules/
container.bind('IUserRepository').toClass(DrizzleUserRepository)
container.bind('CreateUserUseCase').toClass(CreateUserUseCase)

// Use in route handlers
const useCase = getInjection('CreateUserUseCase')
```

## Key Rules

1. **Domain layer has ZERO external imports** (only ddd-kit)
2. **Never throw in Domain/Application** - use Result<T>
3. **Never use null** - use Option<T>
4. **Value Objects use Zod** for validation
5. **Transactions managed in controllers**, passed to use cases as optional param
6. **All dependencies injected** via DI container

## Testing: BDD with TDD

**Behavior-Driven Development only**. No unit tests. Test behaviors through Use Cases.

### Why BDD fits Clean Architecture

- Use Cases ARE behaviors (single responsibility)
- DI allows mocking repositories without touching infrastructure
- Result<T>/Option<T> make assertions explicit
- Tests document business requirements

### Structure

```
apps/nextjs/src/__TESTS__/
├── create-user.test.ts      # One file per Use Case behavior
├── update-user-email.test.ts
└── delete-user.test.ts
```

### Pattern: Given-When-Then

```typescript
describe('CreateUserUseCase', () => {
  // Mock repository via DI
  const mockUserRepo: IUserRepository = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    // ... other methods return Result.ok(None()) by default
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Register mock in DI container
    container.bind('IUserRepository').toConstant(mockUserRepo)
  })

  it('should create user when email is unique', async () => {
    // Given
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(None()))
    mockUserRepo.create.mockResolvedValue(Result.ok(mockUser))

    // When
    const useCase = getInjection('CreateUserUseCase')
    const result = await useCase.execute({ email: 'new@test.com', name: 'Test' })

    // Then
    expect(result.isSuccess).toBe(true)
    expect(mockUserRepo.create).toHaveBeenCalledOnce()
  })

  it('should fail when email already exists', async () => {
    // Given
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Some(existingUser)))

    // When
    const result = await useCase.execute({ email: 'taken@test.com', name: 'Test' })

    // Then
    expect(result.isFailure).toBe(true)
    expect(result.error).toContain('email')
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })
})
```

### Rules

1. **One test file per Use Case** - Tests mirror behaviors
2. **Mock at repository level** - Never mock domain objects
3. **Test Result/Option states** - `isSuccess`, `isFailure`, `isSome`, `isNone`
4. **Name tests as behaviors** - "should [action] when [condition]"
5. **No implementation details** - Test what, not how

## Monorepo

- `apps/nextjs/` - Web + API (Clean Architecture in src/)
- `apps/expo/` - Mobile (Expo Router + NativeWind + React Query)
- `packages/ddd-kit/` - DDD primitives (Result, Option, Entity, etc.)
- `packages/drizzle/` - DB schema and ORM
- `packages/ui/` - Web UI components (shadcn/ui + custom)

## UI Components

### shadcn/ui First

**Always use shadcn/ui components** as the foundation. Before creating custom components:

1. Check if shadcn/ui has the component: `pnpm ui:add [component]`
2. Extend/customize shadcn components rather than building from scratch
3. Follow shadcn patterns (CVA variants, Radix primitives, cn() utility)

```bash
# Add shadcn component
pnpm ui:add button dialog form input

# Available components: https://ui.shadcn.com/docs/components
```

### Component Structure

```
packages/ui/src/components/
├── ui/                   # shadcn/ui only (auto-generated)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── brutalist-button.tsx  # Custom web components
├── feature-card.tsx
└── ...

apps/expo/src/components/
├── ui/                   # Native components (NativeWind)
│   ├── brutalist-button.tsx
│   └── ...
└── hero-section.tsx      # App-specific sections
```

### Rules

1. **Maximize shadcn/ui usage** - Don't reinvent existing components
2. **Extend, don't replace** - Wrap shadcn components with project-specific variants
3. **packages/ui = web only** - For Next.js, use `@packages/ui/components/...`
4. **Expo = separate components** - Native components in `apps/expo/src/components/`
5. **Use CVA** for variants (class-variance-authority)
6. **Use cn()** for class merging

## Environment

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection
