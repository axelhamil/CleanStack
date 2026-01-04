# CleanStack

Production-ready monorepo boilerplate, optimized for AI and human development through Clean Architecture and DDD.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

> **Reference Implementation**: Complete BetterAuth authentication (sign up/in/out, sessions, protected routes) following Clean Architecture + DDD. 100% generated with [Claude Code](https://claude.ai/code). See [Auth Guide](/docs/guides/authentication).

## Why Clean Architecture + DDD with AI?

**This is not a religion. It's a survival kit for the AI era.**

### The Problem No One Talks About

We're living through a revolution. AI can now write entire applications. You describe what you want, hit enter, and watch thousands of lines of code appear. Features that took weeks now take hours. It feels like magic.

**Until it breaks.**

Until the AI hallucinates an API that doesn't exist. Until it introduces a subtle bug in your payment logic that only surfaces in production. Until you ask it to fix something and it makes it worse. Until you're staring at 50 files of interconnected code at 2am, and you realize: *you have no idea how any of this works*.

This is the dirty secret of "vibe-coded" apps. They're fast to build and nearly impossible to maintain. The AI that wrote the code can't reliably debug it. Another AI will struggle to understand it. And you? You're left doing archaeology in your own codebase.

**This is not sustainable.** Not for side projects, not for startups, definitely not for production software.

### Why Humans Still Matter

Here's an uncomfortable truth: **AI is not replacing developers. It's amplifying them.**

The developers who thrive aren't the ones who let AI do everything. They're the ones who know when to trust it and when to step in. They're the ones who can read the code, understand the intent, and fix what's broken.

But you can only do that if the code is *readable*. If there's a structure you can follow. If the patterns are familiar enough that you can trace a bug from symptom to cause without spending three hours just figuring out where to look.

**The human is the safety net.** When AI hallucinates, when it gets stuck in a loop, when it confidently produces nonsense - you need someone who can step in, understand the code, and fix it. That requires code that's designed to be understood.

### Why Clean Architecture + DDD?

Not because it's trendy. Not because Uncle Bob said so. Because it solves real problems:

**1. AI follows these patterns perfectly.**

Clean Architecture and DDD are among the most documented patterns in software engineering. Books, courses, conference talks, thousands of open-source implementations. LLMs have trained on all of it.

When you say "create a SignInUseCase", the AI doesn't guess. It knows: constructor injection, execute method, Result return type, validation first, then business logic. Every time. Consistently.

The patterns are so well-defined that AI rarely deviates. And when you establish conventions in your codebase, it follows them religiously. This is the opposite of vibe-coding - it's *structured generation*.

**2. Humans can debug without archaeology.**

Open `src/domain/user/`. There's your business logic. No frameworks, no database code, no HTTP concerns. Just pure TypeScript describing what a User is and what it can do.

Open `src/application/use-cases/auth/`. There's your features. Each file is one action: SignIn, SignUp, SignOut. You can read the execute() method and understand the entire flow in 30 seconds.

Something broke? The flow is always the same: Controller → Use Case → Domain → Repository. You know exactly where to look. You don't need to understand the whole system. You just need to follow the layers.

Anyone with basic SOLID knowledge can do this. Junior devs, contractors, future you who forgot how this worked - they can all navigate this codebase.

**3. Errors are explicit, not surprises.**

`Result<T>` means every operation that can fail *tells you it can fail*. No hidden exceptions. No try-catch archaeology. The type system shows you every failure path.

`Option<T>` means no null pointer exceptions. Ever. If something might not exist, the type says so. You handle it explicitly or the compiler complains.

When production breaks at 3am, you're not guessing what went wrong. The error handling is built into the architecture.

**4. From MVP to V1 to scale - same code.**

This isn't prototype code that you'll "clean up later" (you won't). This isn't over-engineering for a side project. This is the exact structure that scales.

Your first feature follows the same pattern as your fiftieth. Add a new domain? Same structure. New use case? Same pattern. New adapter for a different database? Swap the implementation, keep the interface.

No rewrites. No "we need to refactor before we can add this feature". The architecture grows with you.

### This Is Not The Only Way

Let's be honest: other patterns exist and work fine.

- **Hexagonal Architecture** - same principles, different names
- **Onion Architecture** - layers pointing inward, very similar
- **Feature-based folders** - simpler, works for smaller apps
- **Plain MVC** - battle-tested, just less explicit

We're not saying Clean Architecture + DDD is the only valid approach.

But it hits a unique sweet spot for AI-assisted development:

| Criteria | Clean Architecture + DDD |
|----------|-------------------------|
| AI can follow it | ✅ Extensively documented, consistent patterns |
| Humans can learn it | ✅ Clear layers, predictable flow |
| Scales to production | ✅ Same structure from MVP to enterprise |
| Debuggable | ✅ Explicit errors, isolated concerns |
| Flexible | ✅ Swap implementations without touching business logic |

### What This Boilerplate Offers

**A starting point that doesn't need to be thrown away.**

- Complete authentication already implemented (100% AI-generated, 100% debuggable)
- Patterns established and documented in CLAUDE.md
- Every layer demonstrated with real code
- Type-safe from domain to API
- Production-ready from day one

**A collaboration model between AI and human.**

- AI generates features following established patterns
- Humans review, debug, and course-correct when needed
- The architecture makes both jobs easier

**An escape hatch from vibe-coding chaos.**

- When AI gets stuck, you can step in
- When you get stuck, AI can help with context
- Neither of you is flying blind

### The Bottom Line

The question isn't "should I use AI to write code?" You already are, or you will be.

The question is: **when AI fails, can you fix it?**

If your codebase is a maze of generated spaghetti, the answer is no. You'll either waste hours understanding it or ask AI to fix it (and watch it make things worse).

If your codebase follows clear patterns with explicit error handling and separated concerns, the answer is yes. You can trace the bug, understand the context, and fix it - with or without AI assistance.

**This boilerplate is a bet on that future.** A future where AI writes most of the code, but humans remain essential for understanding, debugging, and decision-making. A future where the best developers aren't the fastest typists, but the ones who can navigate complexity and fix what's broken.

Clean Architecture + DDD isn't about writing perfect code. It's about writing code that survives contact with reality - including the reality that AI isn't perfect and neither are we.

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
