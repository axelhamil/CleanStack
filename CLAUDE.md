# CLAUDE.md

## Prerequisites

**Before working on this codebase, read and memorize:**
- `packages/ddd-kit/src/` - All DDD primitives (Result, Option, Entity, etc.)
- `packages/test/` - Vitest configuration

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
    ├── controllers/    # HTTP → Use Case (input)
    ├── guards/         # Auth middleware (input)
    ├── repositories/   # Use Case → DB via Domain (output)
    ├── mappers/        # Domain ↔ DB conversion
    └── queries/        # Direct ORM read (CQRS)
```

### CQRS Pattern

- **Commands** (write): Controller → Use Case → Domain → Repository
- **Queries** (read): Controller → Query (direct ORM, bypass domain)

Use `queries/` for read-only operations that don't need domain logic (lists, filters, reports).

## Core Patterns (ddd-kit)

### Result<T,E> - Never throw exceptions

```typescript
// Creation
Result.ok(value)              // Success
Result.fail(error)            // Failure
Result.combine([r1, r2, r3])  // First failure or ok()

// Usage
result.isSuccess / result.isFailure
result.getValue()  // throws if failure
result.getError()  // throws if success
```

### Option<T> - No null/undefined

```typescript
// Creation
Option.some(value)            // Some<T>
Option.none()                 // None<T>
Option.fromNullable(value)    // Some if value, None if null/undefined

// Usage
option.isSome() / option.isNone()
option.unwrap()               // throws if None
option.unwrapOr(defaultValue)
option.map(fn)                // Option<U>
option.flatMap(fn)            // Option<U>
match(option, { Some: v => ..., None: () => ... })
```

### ValueObject<T>

```typescript
export class Email extends ValueObject<string> {
  // validate() called automatically by create()
  protected validate(value: string): Result<string> {
    if (!value.includes('@')) return Result.fail('Invalid email')
    return Result.ok(value)
  }
}

// Usage
const result = Email.create('test@example.com')  // Result<Email>
if (result.isSuccess) {
  const email = result.getValue()
  email.value  // 'test@example.com'
}
```

### Entity & Aggregate

```typescript
// ID class (typed UUID wrapper)
export class UserId extends UUID<string> {
  static create(id: UUID<string>): UserId { return new UserId(id.value) }
}

// Entity/Aggregate definition
interface IUserProps {
  email: Email;
  name: Name;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Entity<IUserProps> {
  private constructor(props: IUserProps, id?: UUID<string>) {
    super(props, id);
  }

  get id(): UserId { return UserId.create(this._id) }

  // Factory method - returns entity directly, no Result wrapper
  static create(props: IUserProps, id?: UUID<string>): User {
    const newId = id ?? new UUID<string>();
    return new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      newId,
    );
  }

  // Mutation methods modify _props directly
  updateName(name: Name): void {
    this._props.name = name;
    this._props.updatedAt = new Date();
  }
}

// Entity methods
entity._id                    // UUID
entity._props                 // T (mutable internally)
entity.get('propName')        // Access prop (throws if missing)
entity.getProps()             // Shallow copy of props
entity.toObject()             // Plain object (resolves VOs, entities)
entity.clone({ ...overrides }) // New instance, same ID

// Aggregate methods (extends Entity)
aggregate.domainEvents        // DomainEvent[]
aggregate.addEvent(event)     // Register event
aggregate.markEventsForDispatch()
aggregate.clearEvents()
```

### BaseRepository<T>

```typescript
interface BaseRepository<T extends IEntity<unknown>> {
  create(entity: T, trx?): Promise<Result<T>>
  update(entity: T, trx?): Promise<Result<T>>
  delete(id: T['_id'], trx?): Promise<Result<T['_id']>>
  findById(id: T['_id']): Promise<Result<Option<T>>>
  findAll(): Promise<Result<T[]>>
  findBy(props: Partial<T['_props']>): Promise<Result<Option<T>>>
  exists(id: T['_id']): Promise<Result<boolean>>
  count(): Promise<Result<number>>
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

1. **Domain layer has ZERO external imports** (only ddd-kit + Zod)
2. **Never throw in Domain/Application** - use Result<T>
3. **Never use null** - use Option<T>
4. **Value Objects use Zod** for validation (pragmatic choice: Zod is stable, well-tested, and provides excellent type inference - rewriting validation logic would be error-prone and wasteful)
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
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()))
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
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.some(existingUser)))

    // When
    const result = await useCase.execute({ email: 'taken@test.com', name: 'Test' })

    // Then
    expect(result.isFailure).toBe(true)
    expect(result.getError()).toContain('email')
    expect(mockUserRepo.create).not.toHaveBeenCalled()
  })
})
```

### Rules

1. **One test file per Use Case** - Tests mirror behaviors
2. **Mock at repository level** - Never mock domain objects
3. **Test Result/Option states** - `isSuccess`, `isFailure`, `isSome()`, `isNone()`
4. **Name tests as behaviors** - "should [action] when [condition]"
5. **No implementation details** - Test what, not how
6. **Use getValue()/getError()** - Not `.value`/`.error`

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
