# CLAUDE.md

## Quick Start

### 1. Setup (2 min)
```bash
git clone <repo>
cd nextjs-clean-architecture-starter
pnpm install
pnpm db           # Start PostgreSQL
pnpm db:push      # Push schema
pnpm dev          # Start dev server
```

### 2. Generate PRD (Interactive)
```
/feature-prd
```
Conversational domain discovery with EventStorming + structured PRD generation.

### 3. Generate Code
```
/gen-domain [aggregate spec]
/gen-usecase [use case spec]
/gen-tests [use case name]
```

### 4. Implement & Test
Claude writes the implementation. Run:
```bash
pnpm test
pnpm check:all
```

### Example: Add "Bookmark" Feature

1. `/feature-prd` → "Users can bookmark articles" (interactive discovery)
2. `/gen-domain Bookmark with userId, articleId, createdAt`
3. `/gen-usecase CreateBookmark`
4. `/gen-tests CreateBookmarkUseCase`
5. `pnpm test` → All green

---

## Prerequisites

**Read first:** `packages/ddd-kit/src/` (Result, Option, Entity) • `packages/test/`

## Project Overview

Production-ready monorepo: Clean Architecture + DDD. Optimized for AI development.

**Stack**: Next.js 16 • TypeScript • Drizzle • PostgreSQL • BetterAuth • shadcn/ui • Tailwind 4

### Reference Implementation

**Complete auth example** (100% Claude Code): Sign up/in/out, sessions, email verification, protected routes.

Study these files:
- `src/domain/user/` - Aggregate, VOs, events
- `src/application/use-cases/auth/` - All auth use cases
- `src/application/ports/` - IAuthProvider, IUserRepository
- `src/adapters/services/auth/` - BetterAuth service
- `src/adapters/guards/` - requireAuth()
- `app/(auth)/` + `app/(protected)/` - Pages

## Commands

```bash
# Development
pnpm dev              # Dev server (Next.js)
pnpm build            # Build all

# Quality
pnpm type-check       # TypeScript check
pnpm check            # Biome lint + format check
pnpm fix              # Auto-fix lint/format issues
pnpm check:duplication # Code duplication check
pnpm check:unused     # Unused code check (knip)
pnpm check:all        # Run all checks + tests

# Testing
pnpm test             # Run tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage

# Database
pnpm db               # Start PostgreSQL
pnpm db:push          # Push schema
pnpm db:generate      # Generate migrations

# UI
pnpm ui:add           # Add shadcn component
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
│       ├── actions/      # Server actions
│       ├── controllers/  # HTTP handlers
│       ├── guards/       # Auth middleware
│       ├── repositories/ # DB impl
│       ├── mappers/      # Domain ↔ DB
│       ├── queries/      # CQRS reads
│       └── services/     # External service implementations
│           ├── auth/     # Auth provider (BetterAuth)
│           ├── llm/      # LLM provider (AI SDK)
│           └── email/    # Email service
├── common/
│   ├── auth.ts           # BetterAuth config
│   └── di/               # DI container + modules
└── app/api/auth/[...all]/ # BetterAuth route
```

**Adapters organization:**
- `services/` - All external service implementations grouped together (auth, llm, email, etc.)
- Each service in its own subfolder under `services/`
- Avoids proliferation of top-level adapter folders

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
  get id(): UserId { return UserId.create(this._id) }  // Only getter needed!

  static create(props, id?): User {
    return new User({ ...props, createdAt: new Date() }, id ?? new UUID());
  }

  updateName(name: Name): void {
    this._props.name = name;
    this._props.updatedAt = new Date();
  }
}

// Entity API - use get() for property access, NOT custom getters
entity.get('propertyName')  // Returns typed property value
entity._id / entity._props  // Direct access (internal use)
entity.getProps() / entity.toObject() / entity.clone({...})

// Aggregate API
aggregate.domainEvents / aggregate.addEvent(e) / aggregate.clearEvents()
```

**Minimal getters pattern:** Only define `get id()` getter. Access all other properties via `entity.get('propName')` method inherited from Entity/Aggregate base class.

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
9. **Only `get id()` getter** → Use `entity.get('propName')` method for all property access. No other getters needed.

## Templates

### Aggregate Template

```typescript
// src/domain/{name}/{name}.aggregate.ts
import { Aggregate, UUID } from "@packages/ddd-kit";
import { {Name}Id } from "./{name}-id";
import { {Name}CreatedEvent } from "./events/{name}-created.event";

interface I{Name}Props {
  // Add properties
  createdAt: Date;
  updatedAt?: Date;
}

export class {Name} extends Aggregate<I{Name}Props> {
  get id(): {Name}Id {
    return {Name}Id.create(this._id);
  }

  // No other getters - use this.get('propName') or entity.get('propName')

  static create(
    props: Omit<I{Name}Props, "createdAt" | "updatedAt">,
    id?: UUID
  ): {Name} {
    const entity = new {Name}(
      { ...props, createdAt: new Date() },
      id ?? new UUID()
    );
    entity.addEvent(new {Name}CreatedEvent(entity));
    return entity;
  }

  static reconstitute(props: I{Name}Props, id: UUID): {Name} {
    return new {Name}(props, id);
  }

  // Add methods that modify state
}
```

### Value Object Template

```typescript
// src/domain/{aggregate}/value-objects/{name}.vo.ts
import { ValueObject, Result } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.string().min(1).max(100);

export class {Name} extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);
    if (!result.success) {
      return Result.fail(result.error.errors[0].message);
    }
    return Result.ok(result.data);
  }
}
```

### UseCase Template

```typescript
// src/application/use-cases/{domain}/{name}.use-case.ts
import { UseCase, Result, match } from "@packages/ddd-kit";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { I{Name}InputDto, I{Name}OutputDto } from "@/application/dto/{domain}/{name}.dto";

export class {Name}UseCase implements UseCase<I{Name}InputDto, I{Name}OutputDto> {
  constructor(
    private readonly repo: IRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(input: I{Name}InputDto): Promise<Result<I{Name}OutputDto>> {
    // 1. Validate & create VOs
    // 2. Business logic
    // 3. Persist
    // 4. Dispatch events
    // 5. Return DTO
  }
}
```

### Test Template

```typescript
// src/application/use-cases/{domain}/__tests__/{name}.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Result, Option } from "@packages/ddd-kit";

describe("{Name}UseCase", () => {
  let useCase: {Name}UseCase;
  let mockRepo: MockRepo;
  let mockEventDispatcher: IEventDispatcher;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = { method: vi.fn() };
    mockEventDispatcher = { dispatch: vi.fn(), dispatchAll: vi.fn() };
    useCase = new {Name}UseCase(mockRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should {action} when {condition}", async () => {
      // Arrange
      mockRepo.method.mockResolvedValue(Result.ok(value));

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("should fail when {field} is invalid", async () => {
      const result = await useCase.execute({ ...input, field: "invalid" });
      expect(result.isFailure).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should fail when repository returns error", async () => {
      mockRepo.method.mockResolvedValue(Result.fail("Database error"));
      const result = await useCase.execute(input);
      expect(result.isFailure).toBe(true);
    });
  });
});
```

### Domain Event Template

```typescript
// src/domain/{aggregate}/events/{name}.event.ts
import { BaseDomainEvent } from "@packages/ddd-kit";

interface I{Name}EventPayload {
  aggregateId: string;
  // Add payload fields
}

export class {Name}Event extends BaseDomainEvent<I{Name}EventPayload> {
  readonly eventType = "{aggregate}.{action}";

  constructor(aggregate: {Aggregate}) {
    super();
    this.aggregateId = aggregate.id.value;
    this.payload = {
      aggregateId: aggregate.id.value,
      // Map payload fields
    };
  }
}
```

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
```

## Monorepo

- `apps/nextjs/` - Web + API
- `packages/ddd-kit/` - DDD primitives
- `packages/drizzle/` - DB schema
- `packages/ui/` - Shared components

## Environment

`.env`: `DATABASE_URL` - PostgreSQL connection

## Development Workflow

### Interactive Flow

```
┌─────────────────┐
│   Feature PRD   │  /feature-prd
│  (Discovery +   │  → EventStorming + Structured PRD
│   Specification)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Domain Layer   │  /gen-domain
│  (Aggregates)   │  → Entities, VOs, Events
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Application     │  /gen-usecase
│  (Use Cases)    │  → UseCases, DTOs, DI
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Testing      │  /gen-tests
│  (BDD Tests)    │  → Comprehensive tests
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Validation    │  pnpm check:all
│  (Quality)      │  → lint, types, tests, duplication
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Deploy       │  git commit && git push
│  (Production)   │  → CI/CD
└─────────────────┘
```

### Autonomous Flow (Ralph Wiggum)

For complex features, use the autonomous agent loop:

```
┌─────────────────┐
│   Feature PRD   │  /feature-prd
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Create Plan   │  /create-plan
│  (plan.md +     │  → JSON tasks + PROMPT.md
│   PROMPT.md)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create Activity │  /create-activity
│  (activity.md)  │  → Session log template
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Autonomous Agent Loop      │
│  ┌────────────────────────────┐ │
│  │ Read activity.md (state)   │ │
│  └─────────────┬──────────────┘ │
│                │                │
│                ▼                │
│  ┌────────────────────────────┐ │
│  │ Find next task in plan.md │ │
│  │     (passes: false)        │ │
│  └─────────────┬──────────────┘ │
│                │                │
│                ▼                │
│  ┌────────────────────────────┐ │
│  │ Complete task steps        │ │
│  │ Update plan.md + log       │ │
│  │ Git commit                 │ │
│  └─────────────┬──────────────┘ │
│                │                │
│                ▼                │
│           [Repeat]              │
└─────────────────────────────────┘
```

### Step Details

#### 1. Feature PRD
Conversational domain discovery:
- EventStorming (Events, Commands, Aggregates, Policies)
- 10 essential aspects covered
- Structured PRD with implementation checklist

#### 2. Domain Layer
Generated files:
- `src/domain/{feature}/{feature}.aggregate.ts`
- `src/domain/{feature}/value-objects/*.vo.ts`
- `src/domain/{feature}/events/*.event.ts`

#### 3. Application Layer
Generated files:
- `src/application/use-cases/{feature}/*.use-case.ts`
- `src/application/dto/{feature}/*.dto.ts`
- `common/di/modules/{feature}.module.ts`

#### 4. Testing
Generated files:
- `src/application/use-cases/{feature}/__tests__/*.test.ts`

#### 5. Validation
Quality checks:
- `pnpm check` - Code style
- `pnpm type-check` - TypeScript
- `pnpm test` - All tests
- `pnpm check:duplication` - No copy-paste
- `pnpm check:unused` - No dead code

## Skills Reference

### /feature-prd
**Purpose:** Conversational PRD with EventStorming discovery

**Usage:**
```
/feature-prd
```

**Process:**
1. EventStorming discovery (Events, Commands, Aggregates, Policies)
2. Feature deep dive (10 essential aspects)
3. Technology research (WebSearch, Context7)
4. PRD generation with implementation checklist

**Output:** Comprehensive PRD with domain model, use cases, API, file locations

---

### /create-plan
**Purpose:** Generate plan.md + PROMPT.md for autonomous workflow

**Usage:**
```
/create-plan
```

**Output:**
- `plan.md` - JSON task list with steps and passes:false/true
- `PROMPT.md` - Agent instructions for Ralph Wiggum loop

---

### /create-activity
**Purpose:** Initialize activity.md for session logging

**Usage:**
```
/create-activity
```

**Output:** `activity.md` with status tracking and session log template

---

### /gen-domain
**Purpose:** Generate domain layer code

**Usage:**
```
/gen-domain [Aggregate] with [properties]
```

**Output:** Aggregate, VOs, Events files

**Example:**
```
/gen-domain Notification with userId, type, message, readAt
```

---

### /gen-usecase
**Purpose:** Generate use case with DTOs and DI

**Usage:**
```
/gen-usecase [UseCaseName]: [description]
```

**Output:** UseCase, DTOs, DI registration

**Example:**
```
/gen-usecase MarkNotificationRead: marks a notification as read for user
```

---

### /gen-tests
**Purpose:** Generate BDD tests for use case

**Usage:**
```
/gen-tests [UseCaseName]
```

**Output:** Comprehensive test file

## Agents Reference

### feature-architect
**Purpose:** Design feature architecture before implementation

**When to use:**
- Starting a new feature
- Unsure about structure
- Want to follow existing patterns

**What it does:**
1. Analyzes existing codebase patterns
2. Proposes file structure
3. Identifies needed components
4. Creates implementation blueprint

**Invoke:**
```
Use the feature-architect agent to design [feature name]
```

---

### code-reviewer
**Purpose:** Review code for issues before commit

**When to use:**
- After implementing feature
- Before creating PR
- Want quality check

**What it does:**
1. Checks Clean Architecture compliance
2. Verifies DDD patterns
3. Finds bugs and code smells
4. Suggests improvements

**Invoke:**
```
Use the code-reviewer agent to review [file or feature]
```

**Output:** Issues by severity with fixes

---

### test-writer
**Purpose:** Generate comprehensive tests

**When to use:**
- After implementing use case
- Need more test coverage
- Want BDD-style tests

**What it does:**
1. Analyzes implementation
2. Identifies all code paths
3. Writes comprehensive tests
4. Covers edge cases

**Invoke:**
```
Use the test-writer agent to write tests for [use case]
```

---

### doc-writer
**Purpose:** Update documentation

**When to use:**
- After adding feature
- After changing patterns
- README needs update

**What it does:**
1. Identifies affected docs
2. Updates CLAUDE.md sections
3. Updates README
4. Keeps examples current

**Invoke:**
```
Use the doc-writer agent to update docs for [feature]
```

## Decision Trees

### Entity vs Aggregate

```
Does it have a unique identity?
├─ No → Value Object
└─ Yes → Does it own other entities?
         ├─ No → Entity
         └─ Yes → Does it need domain events?
                  ├─ No → Entity (root of group)
                  └─ Yes → Aggregate
```

**Examples:**
- Email → Value Object (no identity)
- Address → Entity (identity, no children)
- User → Aggregate (has identity, owns sessions, emits events)
- Order → Aggregate (owns OrderItems, emits events)

---

### Result vs Option

```
Can the operation fail with an error message?
├─ Yes → Result<T>
│        └─ Multiple failure reasons? → Result<T, ErrorEnum>
└─ No → Is the value optional/nullable?
        ├─ Yes → Option<T>
        └─ No → Plain T
```

**Examples:**
- `Email.create()` → `Result<Email>` (can fail: invalid format)
- `findById()` → `Result<Option<User>>` (can fail: DB error, can be missing)
- `user.name` → `Name` (required, validated at creation)
- `user.bio` → `Option<Bio>` (optional, no error if missing)

---

### When to Emit Domain Events

```
Is this a significant business state change?
├─ No → Don't emit
└─ Yes → Should other parts of system react?
         ├─ No → Don't emit
         └─ Yes → Emit event
                  └─ Dispatch AFTER repository.save()
```

**Emit for:**
- User registration (send welcome email)
- Subscription created (provision resources)
- Payment failed (notify user)

**Don't emit for:**
- User updated name (no side effects)
- Internal state changes

---

### Repository vs Query

```
Need to modify data?
├─ Yes → Repository (through Use Case)
└─ No → Need domain logic?
        ├─ Yes → Repository (returns Aggregate)
        └─ No → Is this a simple read?
                ├─ Yes → Query (direct ORM)
                └─ No → Repository + DTO
```

**Use Repository when:**
- Creating/updating entities
- Need to apply business rules
- Need aggregate with full state

**Use Query when:**
- Dashboard statistics
- List views with filters
- Reports
- No business logic needed

---

### CQRS Decision

```
Command or Query?

Command (write):
Controller → UseCase → Aggregate → Repository
                            ↓
                   EventDispatcher → Handlers

Query (read):
Controller → Query → Database
                ↓
            DTO Response
```

## Domain Events

### Overview

Domain events capture significant business state changes. They enable:
- Loose coupling between components
- Side effects (emails, notifications)
- Audit logging
- Event-driven workflows

### Event Structure

```typescript
// src/domain/user/events/user-created.event.ts
export class UserCreatedEvent extends DomainEvent<{
  userId: string;
  email: string;
  name: string;
}> {
  readonly eventType = "user.created";

  constructor(user: User) {
    super();
    this.aggregateId = user.id.value;
    this.payload = {
      userId: user.id.value,
      email: user.email.value,
      name: user.name.value,
    };
  }
}
```

### Emitting Events

Events are added in aggregate methods, NOT dispatched:

```typescript
// In aggregate
static create(props: CreateProps): User {
  const user = new User({ ...props, createdAt: new Date() }, new UUID());
  user.addEvent(new UserCreatedEvent(user)); // Added, not dispatched!
  return user;
}

verifyEmail(): void {
  this._props.emailVerified = true;
  this.addEvent(new UserEmailVerifiedEvent(this));
}
```

### Dispatching Events

**CRITICAL:** Events dispatch AFTER successful persistence:

```typescript
// In use case
async execute(input: Input): Promise<Result<Output>> {
  // 1. Create aggregate (events added internally)
  const user = User.create(props);

  // 2. Persist FIRST
  const saveResult = await this.userRepo.create(user);
  if (saveResult.isFailure) {
    return Result.fail(saveResult.getError());
    // Events NOT dispatched on failure!
  }

  // 3. Dispatch AFTER save succeeds
  await this.eventDispatcher.dispatchAll(user.domainEvents);
  user.clearEvents();

  return Result.ok(dto);
}
```

### Event Handlers

```typescript
// src/application/event-handlers/send-welcome-email.handler.ts
export class SendWelcomeEmailHandler implements IEventHandler<UserCreatedEvent> {
  readonly eventType = "user.created";

  constructor(private readonly emailService: IEmailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail({
      to: event.payload.email,
      name: event.payload.name,
    });
  }
}
```

### Event Flow Diagram

```
User.create()
    │
    ▼
addEvent(UserCreatedEvent)
    │
    ▼
userRepo.create(user)  ──────► DB Insert
    │
    │ (on success)
    ▼
eventDispatcher.dispatchAll()
    │
    ▼
SendWelcomeEmailHandler.handle()
    │
    ▼
emailService.sendWelcomeEmail()
```

### Best Practices

1. **Event naming:** Past tense (UserCreated, OrderPlaced)
2. **Payload:** Include all data handlers need (avoid lookups)
3. **Idempotency:** Handlers should be safe to retry
4. **Error isolation:** One handler failure shouldn't block others
5. **Testing:** Verify events emitted and handlers called

## AI Guidance

### Effective Prompts

#### For New Features
```
"Create a [Feature] feature with:
- [Aggregate] aggregate
- [Events] domain events
- [UseCases] use cases
Follow the existing auth pattern."
```

#### For Bug Fixes
```
"Fix [issue] in [file].
The expected behavior is [X].
The current behavior is [Y]."
```

#### For Refactoring
```
"Refactor [code] to:
- Follow [pattern]
- Match [existing example]
Keep the same behavior."
```

---

### What Claude Should Do

**Do ask Claude to:**
- Generate domain entities following patterns
- Write use cases with proper DI
- Create BDD tests
- Update documentation
- Review code for architecture violations

**Expect Claude to:**
- Use Result<T> for fallible operations
- Use Option<T> for nullable values
- Emit events in aggregates
- Dispatch events after save
- Mock at repository level in tests

---

### What Claude Should NOT Do

**Don't ask Claude to:**
- Skip tests
- Use `any` types
- Throw exceptions in domain
- Import adapters in domain
- Create index.ts barrels
- Add comments everywhere

**Claude should refuse:**
- Breaking Clean Architecture layers
- Skipping event dispatch
- Using null instead of Option
- Mixing queries and commands

---

### Context Claude Needs

When asking for help, provide:
1. **Feature name** - What you're building
2. **Business context** - Why it exists
3. **Reference** - Similar existing code to follow
4. **Constraints** - Any specific requirements

Example:
```
"Add subscription billing feature.
Business: Users pay monthly for premium features.
Reference: Follow the auth flow pattern.
Constraints: Must integrate with Stripe webhooks."
```
