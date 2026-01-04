# CLAUDE.md

## Prerequisites

**Read first:** `packages/ddd-kit/src/` (Result, Option, Entity) • `packages/test/`

## Project Overview

Production-ready monorepo: Clean Architecture + DDD. Optimized for AI development.

**Stack**: Next.js 16 • Expo • TypeScript • Drizzle • PostgreSQL • BetterAuth • shadcn/ui • Tailwind 4

### Reference Implementation

**Complete auth example** (100% Claude Code): Sign up/in/out, sessions, email verification, protected routes.

Study these files:
- `src/domain/user/` - Aggregate, VOs, events
- `src/application/use-cases/auth/` - All auth use cases
- `src/application/ports/` - IAuthProvider, IUserRepository
- `src/adapters/auth/` - BetterAuth service
- `src/adapters/guards/` - requireAuth()
- `app/(auth)/` + `app/(protected)/` - Pages

## Commands

```bash
pnpm dev          # Dev (runs db:generate)
pnpm build        # Build all
pnpm type-check   # Type check
pnpm fix          # Lint/format
pnpm db           # Start PostgreSQL
pnpm db:push      # Push schema
pnpm test         # Run tests
pnpm ui:add       # Add shadcn component
```

## Architecture

```
Domain (Core)     → Entities, VOs, Aggregates, Events
    ↑
Application       → Use Cases, Ports
    ↑
Adapters          → Controllers, Repositories, Guards
    ↑
Infrastructure    → DB, DI config
```

### Structure

```
apps/nextjs/
├── src/
│   ├── domain/           # Entities, VOs, Events
│   ├── application/
│   │   ├── use-cases/    # Business logic
│   │   ├── ports/        # Interfaces (IXxxRepository, IXxxProvider)
│   │   └── dto/          # Zod schemas
│   └── adapters/
│       ├── auth/         # Auth provider impl
│       ├── actions/      # Server actions
│       ├── controllers/  # HTTP handlers
│       ├── guards/       # Auth middleware
│       ├── repositories/ # DB impl
│       ├── mappers/      # Domain ↔ DB
│       └── queries/      # CQRS reads
├── common/
│   ├── auth.ts           # BetterAuth config
│   └── di/               # DI container + modules
└── app/api/auth/[...all]/ # BetterAuth route
```

### CQRS

- **Commands**: Controller → Use Case → Domain → Repository
- **Queries**: Controller → Query (direct ORM)

## Core Patterns (ddd-kit)

### Result<T,E>

```typescript
Result.ok(value)              // Success
Result.fail(error)            // Failure
Result.combine([r1, r2, r3])  // First failure or ok()

result.isSuccess / result.isFailure
result.getValue()  // throws if failure
result.getError()  // throws if success
```

### Option<T>

```typescript
Option.some(value)            // Some<T>
Option.none()                 // None<T>
Option.fromNullable(value)    // Some if value, None if null

option.isSome() / option.isNone()
option.unwrap()               // throws if None
option.unwrapOr(default)
option.map(fn) / option.flatMap(fn)
match(option, { Some: v => ..., None: () => ... })
```

### ValueObject<T>

```typescript
export class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    if (!value.includes('@')) return Result.fail('Invalid email')
    return Result.ok(value)
  }
}

const result = Email.create('test@example.com')  // Result<Email>
email.value  // 'test@example.com'
```

### Entity & Aggregate

```typescript
export class UserId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "UserId";
  static create(id: UUID<string | number>): UserId { return new UserId(id.value); }
}

export class User extends Aggregate<IUserProps> {
  get id(): UserId { return UserId.create(this._id) }

  static create(props, id?): User {
    return new User({ ...props, createdAt: new Date() }, id ?? new UUID());
  }

  updateName(name: Name): void {
    this._props.name = name;
    this._props.updatedAt = new Date();
  }
}

// Entity API
entity._id / entity._props / entity.get('prop')
entity.getProps() / entity.toObject() / entity.clone({...})

// Aggregate API
aggregate.domainEvents / aggregate.addEvent(e) / aggregate.clearEvents()
```

### BaseRepository<T>

```typescript
interface BaseRepository<T> {
  create(entity, trx?): Promise<Result<T>>
  update(entity, trx?): Promise<Result<T>>
  delete(id, trx?): Promise<Result<id>>
  findById(id): Promise<Result<Option<T>>>
  findAll(pagination?): Promise<Result<PaginatedResult<T>>>
  findMany(props, pagination?): Promise<Result<PaginatedResult<T>>>
  findBy(props): Promise<Result<Option<T>>>
  exists(id): Promise<Result<boolean>>
  count(): Promise<Result<number>>
}

// Pagination
interface PaginationParams { page: number; limit: number }
interface PaginatedResult<T> {
  data: T[];
  pagination: { page, limit, total, totalPages, hasNextPage, hasPreviousPage }
}
const DEFAULT_PAGINATION = { page: 1, limit: 20 }
createPaginatedResult(data, params, total)  // Helper
```

### Use Cases

```typescript
export class SignInUseCase implements UseCase<Input, Output> {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input): Promise<Result<Output>> {
    const emailResult = Email.create(input.email);
    const passwordResult = Password.create(input.password);
    const combined = Result.combine([emailResult, passwordResult]);
    if (combined.isFailure) return Result.fail(combined.getError());

    const userResult = await this.checkUserExists(emailResult.getValue());
    if (userResult.isFailure) return Result.fail(userResult.getError());

    const authResult = await this.authProvider.signIn(userResult.getValue(), passwordResult.getValue());
    if (authResult.isFailure) return Result.fail(authResult.getError());

    return Result.ok(this.toDto(authResult.getValue()));
  }

  private async checkUserExists(email: Email): Promise<Result<User>> {
    const result = await this.userRepo.findByEmail(email.value);
    if (result.isFailure) return Result.fail(result.getError());

    return match<User, Result<User>>(result.getValue(), {
      Some: (user) => Result.ok(user),
      None: () => Result.fail("Email not found"),
    });
  }

  private toDto(response): Output { /* map to DTO */ }
}
```

### DTOs

Common schemas in `dto/common.dto.ts`, feature DTOs compose them:

```typescript
// common.dto.ts
export const userDtoSchema = z.object({ id: z.string(), email: z.string(), name: z.string() });

// sign-in.dto.ts
export const signInInputDtoSchema = z.object({ email: z.email(), password: z.string().min(8) });
export const signInOutputDtoSchema = z.object({ user: userDtoSchema, token: z.string() });
export type ISignInInputDto = z.infer<typeof signInInputDtoSchema>;
```

### Ports

```typescript
export interface IAuthProvider {
  signIn(user: User, password: Password): Promise<Result<AuthResponse>>;
  signUp(user: User, password: Password): Promise<Result<AuthResponse>>;
  signOut(headers: Headers): Promise<Result<void>>;
  getSession(headers: Headers): Promise<Result<Option<AuthSession>>>;
}
```

### DI

```typescript
// modules/auth.module.ts
export const createAuthModule = () => {
  const m = createModule();
  m.bind(DI_SYMBOLS.IUserRepository).toClass(DrizzleUserRepository);
  m.bind(DI_SYMBOLS.SignInUseCase).toClass(SignInUseCase, [DI_SYMBOLS.IUserRepository, DI_SYMBOLS.IAuthProvider]);
  return m;
};

// Usage
const useCase = getInjection("SignInUseCase");
```

### Guards

```typescript
export async function requireAuth(redirectTo = "/login"): Promise<IGetSessionOutputDto> {
  const headersList = await headers();
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headersList);

  if (result.isFailure) redirect(redirectTo);

  return match<IGetSessionOutputDto, IGetSessionOutputDto>(result.getValue(), {
    Some: (session) => session,
    None: () => redirect(redirectTo),
  });
}
```

## Key Rules

1. **Domain = zero external imports** (only ddd-kit + Zod)
2. **Never throw** in Domain/Application → use Result<T>
3. **Never null** → use Option<T>
4. **VOs use Zod** for validation
5. **Transactions** managed in controllers, passed to use cases
6. **All deps injected** via DI
7. **No index.ts barrels** → import directly
8. **No comments** → self-documenting code

## Testing: BDD

Test behaviors via Use Cases, not units.

```typescript
describe('CreateUserUseCase', () => {
  const mockUserRepo: IUserRepository = { create: vi.fn(), findByEmail: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks();
    container.bind('IUserRepository').toConstant(mockUserRepo);
  })

  it('should create user when email is unique', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()));
    mockUserRepo.create.mockResolvedValue(Result.ok(mockUser));

    const result = await getInjection('CreateUserUseCase').execute({ email: 'new@test.com' });

    expect(result.isSuccess).toBe(true);
    expect(mockUserRepo.create).toHaveBeenCalledOnce();
  })
})
```

**Rules**: One file per Use Case • Mock at repository level • Test Result/Option states • Name as behaviors

## Page Structure

Pages = orchestration only. Logic in `_components/`.

```
app/(auth)/login/
├── page.tsx              # Composes LoginForm
└── _components/
    └── login-form.tsx    # Client component with logic
```

```typescript
// page.tsx - Server Component
export default async function DashboardPage() {
  const session = await requireAuth();
  return <ProfileCard user={session.user} />;
}
```

**Rules**: Pages compose • Logic in _components • Server by default • Guards in layouts

## UI

**shadcn/ui first**: `pnpm ui:add button form input`

```
packages/ui/src/components/ui/  # shadcn (auto-generated)
apps/expo/src/components/       # Native (NativeWind)
```

## Monorepo

- `apps/nextjs/` - Web + API
- `apps/expo/` - Mobile
- `packages/ddd-kit/` - DDD primitives
- `packages/drizzle/` - DB schema
- `packages/ui/` - Web components

## Environment

`.env`: `DATABASE_URL` - PostgreSQL connection
