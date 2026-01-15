# REL-006: Complete Tutorial Documentation

## Story

**As a** developer new to the boilerplate
**I want** a complete step-by-step tutorial
**So that** I can be productive quickly despite the rich feature set

## Acceptance Criteria

- [ ] Quick start (< 5 min to running app)
- [ ] Full tutorial (build a feature end-to-end)
- [ ] AI workflow guide
- [ ] Video-friendly format (can be recorded)
- [ ] Troubleshooting section
- [ ] FAQ

## Technical Notes

### Documentation Structure

```
docs/
├── README.md                    # Entry point
├── 01-quick-start.md           # 5 min setup
├── 02-architecture.md          # Understanding the structure
├── 03-tutorial-first-feature.md # Complete walkthrough
├── 04-ai-workflow.md           # Using skills & agents
├── 05-deployment.md            # Going to production
├── 06-troubleshooting.md       # Common issues
└── 07-faq.md                   # Frequently asked questions
```

### 01 - Quick Start (5 minutes)

```markdown
# Quick Start

Get your app running in 5 minutes.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

## Setup

\`\`\`bash
# Clone the repo
git clone https://github.com/you/nextjs-clean-starter.git my-app
cd my-app

# Install dependencies
pnpm install

# Start database
pnpm db

# Push schema
pnpm db:push

# Start dev server
pnpm dev
\`\`\`

Open http://localhost:3000 🎉

## What's Working

- ✅ Auth (sign up, sign in, sign out)
- ✅ Email verification
- ✅ Protected routes
- ✅ Dashboard layout

## Next Steps

→ [Build Your First Feature](./03-tutorial-first-feature.md)
→ [Understand the Architecture](./02-architecture.md)
```

### 02 - Architecture Overview

```markdown
# Architecture

This boilerplate uses Clean Architecture + DDD.

## The Layers

\`\`\`
┌─────────────────────────────────────────┐
│           Presentation (app/)           │
│         Pages, Components, API          │
├─────────────────────────────────────────┤
│         Adapters (src/adapters/)        │
│  Controllers, Repositories, Services    │
├─────────────────────────────────────────┤
│       Application (src/application/)    │
│     Use Cases, DTOs, Ports (interfaces) │
├─────────────────────────────────────────┤
│          Domain (src/domain/)           │
│   Entities, Value Objects, Events       │
└─────────────────────────────────────────┘
\`\`\`

## Key Concepts

### Result<T> - No Exceptions
\`\`\`typescript
// Instead of throwing
const result = await useCase.execute(input);
if (result.isFailure) {
  return handleError(result.getError());
}
const data = result.getValue();
\`\`\`

### Option<T> - No Nulls
\`\`\`typescript
const userOption = await repo.findById(id);
match(userOption, {
  Some: (user) => doSomething(user),
  None: () => handleNotFound(),
});
\`\`\`

### Value Objects - Validated Data
\`\`\`typescript
const email = Email.create('test@example.com');
if (email.isFailure) {
  // Invalid email
}
\`\`\`
```

### 03 - Tutorial: Build Your First Feature

```markdown
# Tutorial: Build a Notes Feature

We'll build a complete Notes feature using the AI workflow.

**Time:** ~30 minutes
**Prerequisites:** Quick Start completed

## Step 1: EventStorming (2 min)

Tell Claude:
> "Let's model the domain for a Notes feature where users can create, edit, and delete personal notes"

Or use the skill:
\`\`\`
/eventstorming "Personal notes management"
\`\`\`

**Output:** Commands, Events, Aggregates identified

## Step 2: Generate PRD (3 min)

\`\`\`
/feature-prd "Notes management" --events NoteCreated,NoteUpdated,NoteDeleted
\`\`\`

**Output:** User stories, acceptance criteria

## Step 3: Generate Domain (2 min)

\`\`\`
/gen-domain Note
\`\`\`

**Files created:**
- src/domain/note/note.aggregate.ts
- src/domain/note/note-id.vo.ts
- src/domain/note/events/note-created.event.ts
- ...

## Step 4: Generate Use Cases (5 min)

\`\`\`
/gen-usecase CreateNote
/gen-usecase UpdateNote
/gen-usecase DeleteNote
/gen-usecase GetUserNotes
\`\`\`

**Files created:**
- src/application/use-cases/note/*.ts
- src/application/dto/note/*.ts
- common/di/modules/note.module.ts

## Step 5: Implement Repository (5 min)

Tell Claude:
> "Implement the DrizzleNoteRepository"

## Step 6: Create UI (10 min)

Tell Claude:
> "Create a notes page at /dashboard/notes with a list of notes and ability to create/edit/delete"

## Step 7: Add Tests (3 min)

\`\`\`
/gen-tests CreateNoteUseCase
\`\`\`

## Step 8: Commit

\`\`\`bash
git add .
git commit -m "feat(notes): add notes feature with CRUD operations"
\`\`\`

🎉 **Done!** You've built a complete feature.
```

### 04 - AI Workflow Guide

```markdown
# AI Workflow

This boilerplate is designed for AI-assisted development.

## Skills Reference

| Skill | When to Use | Example |
|-------|-------------|---------|
| /eventstorming | Starting a new feature | /eventstorming "User billing" |
| /feature-prd | Documenting requirements | /feature-prd "Export data" |
| /gen-domain | Creating domain layer | /gen-domain Invoice |
| /gen-usecase | Creating use cases | /gen-usecase SendInvoice |
| /gen-tests | Adding tests | /gen-tests SendInvoiceUseCase |

## Agents Reference

| Agent | When Triggered | Purpose |
|-------|----------------|---------|
| feature-architect | "How should I implement..." | Design advice |
| code-reviewer | After code changes | Quality check |
| test-writer | After UseCase creation | BDD tests |
| doc-writer | Before release | Documentation |

## Complete Workflow

\`\`\`
New Feature Request
       │
       ▼
┌──────────────┐
│ EventStorming│ → Understand domain
└──────────────┘
       │
       ▼
┌──────────────┐
│  Feature PRD │ → Document requirements
└──────────────┘
       │
       ▼
┌──────────────┐
│  Gen Domain  │ → Create domain files
└──────────────┘
       │
       ▼
┌──────────────┐
│ Gen UseCase  │ → Create use cases
└──────────────┘
       │
       ▼
┌──────────────┐
│  Implement   │ → Repository, UI, API
└──────────────┘
       │
       ▼
┌──────────────┐
│  Gen Tests   │ → Add BDD tests
└──────────────┘
       │
       ▼
┌──────────────┐
│   Commit     │ → Atomic commit
└──────────────┘
\`\`\`

## Tips

1. **Let Claude suggest** - The hooks will suggest the right skill
2. **One step at a time** - Don't rush, commit after each step
3. **Ask questions** - If unsure, ask Claude before generating
4. **Review generated code** - AI is fast but you know your needs
```

### 05 - Deployment Guide

```markdown
# Deployment

## Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

[Detailed Vercel setup →](./vercel-setup.md)

## Environment Variables Checklist

\`\`\`env
# Required
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Stripe (if using billing)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=
\`\`\`

## Database Options

### Neon (Serverless Postgres)
- Free tier available
- Auto-scaling
- [Setup guide →](./neon-setup.md)

### Supabase
- Free tier available
- Built-in auth (we use BetterAuth instead)
- [Setup guide →](./supabase-setup.md)
```

### 06 - Troubleshooting

```markdown
# Troubleshooting

## Common Issues

### "Cannot find module" after generation
**Solution:** Restart TypeScript server (Cmd+Shift+P → "Restart TS Server")

### "DI Symbol not found"
**Solution:** Check common/di/symbols.ts has your new symbol

### Database connection failed
**Solution:**
1. Is Docker running? \`docker ps\`
2. Is postgres container up? \`pnpm db\`
3. Is DATABASE_URL correct?

### Tests fail with mock errors
**Solution:** Check DI module registration order in test setup

### Commit rejected by hook
**Solution:**
1. Check commit message format: \`type(scope): message\`
2. Run \`pnpm lint:fix\` to fix lint issues
3. Run \`pnpm type-check\` to fix type errors

### Build fails on Vercel
**Solution:**
1. Check all env vars are set
2. Check DATABASE_URL uses pooled connection
3. Check build logs for specific error
```

### 07 - FAQ

```markdown
# FAQ

## General

**Q: Why Clean Architecture?**
A: Testability, maintainability, and clear boundaries. The AI can work faster when structure is clear.

**Q: Can I use this without AI?**
A: Absolutely! The architecture works great manually. AI just speeds things up.

**Q: Is this production-ready?**
A: Yes. Auth, billing, email, and monitoring are all production-grade.

## Technical

**Q: Why Result/Option instead of exceptions?**
A: Explicit error handling, no try-catch everywhere, TypeScript knows all states.

**Q: Why Zod in Value Objects?**
A: Single source of truth for validation, reusable schemas, great error messages.

**Q: Why not tRPC?**
A: Clean Architecture prefers explicit layers. You can add tRPC if you prefer.

**Q: Can I use Prisma instead of Drizzle?**
A: Yes, just implement the repository interfaces with Prisma.

## AI

**Q: Do I need Claude specifically?**
A: Skills are designed for Claude, but the architecture works with any AI.

**Q: The AI isn't using skills automatically?**
A: Check CLAUDE.md is in your project and hooks are enabled.

**Q: Can I create my own skills?**
A: Yes! See docs/creating-skills.md
```

## Definition of Done

- [ ] Quick start works in 5 min
- [ ] Tutorial completable in 30 min
- [ ] All docs proofread
- [ ] Screenshots/diagrams added
- [ ] Links all work
- [ ] Beginner-friendly language
