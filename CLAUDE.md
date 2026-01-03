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

## Monorepo

- `apps/nextjs/` - Web + API (Clean Architecture in src/)
- `apps/expo/` - Mobile (Expo Router + NativeWind + React Query)
- `packages/ddd-kit/` - DDD primitives (Result, Option, Entity, etc.)
- `packages/drizzle/` - DB schema and ORM
- `packages/ui/` - Shared components (shadcn + .web.tsx/.native.tsx)

## UI Components

Create reusable components in `packages/ui/`:

```
packages/ui/src/components/
├── button.tsx          # Shared types/fallback
├── button.web.tsx      # Web version (Next.js)
├── button.native.tsx   # Native version (Expo)
```

- `.web.tsx` - Used by Next.js (auto-resolved by webpack)
- `.native.tsx` - Used by Expo (auto-resolved by Metro)
- `.tsx` - Fallback if no platform-specific file exists

**Always prefer creating shared components** in `packages/ui/` over app-specific components.

## Environment

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection
