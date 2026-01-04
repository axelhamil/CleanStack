# CleanStack

Production-ready monorepo boilerplate, optimized for AI and human development through Clean Architecture and DDD.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

> **Reference Implementation**: Complete BetterAuth authentication (sign up/in/out, sessions, protected routes) following Clean Architecture + DDD. 100% generated with [Claude Code](https://claude.ai/code). See [Auth Guide](/docs/guides/authentication).

## Why Clean Architecture + DDD with AI?

**This is not a religion. It's a survival kit.**

We're in an era where entire apps are "vibe-coded" - generated end-to-end by AI. It works... until it doesn't. Until the AI hallucinates, introduces a subtle bug, or simply can't figure out why your feature broke. Then you're left staring at spaghetti code that neither you nor another AI can untangle.

**Clean Architecture + DDD solves this:**

- **AI follows patterns beautifully.** These patterns are extensively documented, battle-tested for decades. LLMs have seen thousands of examples. When you say "create a use case", the AI knows exactly what structure to produce.

- **Humans can step in anytime.** When the AI fails (and it will), anyone with basic SOLID knowledge can open `src/domain/`, understand the business logic, trace through `application/use-cases/`, and fix the issue. No archaeology required.

- **From MVP to production.** This isn't prototype code that needs rewriting. The same structure scales from your first feature to your hundredth. Add complexity without adding chaos.

- **Debuggable by design.** `Result<T>` means errors are explicit. `Option<T>` means no null surprises. Each layer has one job. When something breaks, you know exactly where to look.

**Other patterns exist.** Hexagonal, Onion, simple MVC - all valid. But Clean Architecture + DDD hits a sweet spot: structured enough for AI to follow, documented enough for humans to learn, flexible enough for real apps.

The goal isn't architectural purity. It's building software that **both AI and humans can maintain** - because you'll need both.

## Quick Start

```bash
pnpm install && cp .env.example .env && pnpm db && pnpm db:push && pnpm dev
```

Visit [localhost:3000](http://localhost:3000)

## Stack

Next.js 16 (App Router) • Expo (React Native) • TypeScript • Drizzle ORM • PostgreSQL • BetterAuth • Cloudflare R2 • shadcn/ui • Tailwind CSS 4

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
async execute(input): Promise<Result<User>> {
  const emailOrError = Email.create(input.email)
  if (emailOrError.isFailure) return Result.fail(emailOrError.error)
  return Result.ok(user)
}
```

### Option<T> - No null/undefined

```typescript
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
```

## Monorepo

- `apps/nextjs/` - Web + API (Clean Architecture in src/)
- `apps/expo/` - Mobile (Expo Router + NativeWind + React Query)
- `packages/ddd-kit/` - DDD primitives (Result, Option, Entity, etc.)
- `packages/drizzle/` - DB schema and ORM
- `packages/ui/` - Shared components (`.web.tsx` / `.native.tsx`)

## UI Components

Create reusable components in `packages/ui/`:
- `.web.tsx` - Next.js (auto-resolved)
- `.native.tsx` - Expo (auto-resolved)
- `.tsx` - Fallback

## Key Rules

1. **Domain layer has ZERO external imports** (only ddd-kit)
2. **Never throw in Domain/Application** - use Result<T>
3. **Never use null** - use Option<T>
4. **Value Objects use Zod** for validation
5. **Transactions managed in controllers**, passed to use cases as optional param
6. **All dependencies injected** via DI container

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI-friendly architecture guide
- **[/docs](http://localhost:3000/docs)** - Full documentation (run `pnpm dev`)

## License

MIT © [AxelHamil](https://github.com/axelhamil)

---

<div align="center">

**Built with [Claude Code](https://claude.ai/code)**

[Report Bug](https://github.com/axelhamil/nextjs-clean-architecture-starter/issues) · [Request Feature](https://github.com/axelhamil/nextjs-clean-architecture-starter/issues)

</div>
