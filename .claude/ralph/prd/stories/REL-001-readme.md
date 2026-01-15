# REL-001: Professional README

## Story

**As a** potential user
**I want** a professional README
**So that** I understand the project value proposition

## Acceptance Criteria

- [ ] Compelling headline
- [ ] Feature list
- [ ] Quick start section
- [ ] Architecture overview
- [ ] Badges (CI, coverage, npm)
- [ ] Screenshots/diagrams

## Content Structure

```markdown
# 🏗️ Next.js Clean Architecture Starter

> The DDD boilerplate optimized for AI-assisted development. Build features in minutes, not hours.

[![CI](badge)](link) [![Coverage](badge)](link) [![License](badge)](link)

## Why This Starter?

| Traditional Dev | With This Starter |
|-----------------|-------------------|
| Design domain model | `/eventstorming` |
| Write specs | `/feature-prd` |
| Scaffold code | `/gen-domain` + `/gen-usecase` |
| Write tests | `/gen-tests` |
| **Hours** | **Minutes** |

## ✨ Features

### Architecture
- 🏛️ **Clean Architecture** - Domain, Application, Adapters layers
- 🎯 **DDD Patterns** - Aggregates, Value Objects, Domain Events
- 📦 **ddd-kit** - Battle-tested DDD primitives (Result, Option, Entity)

### Developer Experience
- 🤖 **AI-First** - Skills and agents for Claude Code
- ⚡ **Type-Safe** - End-to-end TypeScript
- 🧪 **BDD Testing** - Behavior-driven test patterns

### Production Ready
- 🔐 **Authentication** - BetterAuth with sessions
- 💳 **Payments** - Stripe integration
- 📧 **Emails** - Transactional email setup
- 🎨 **UI** - shadcn/ui + Tailwind

## 🚀 Quick Start

\`\`\`bash
# Clone and setup
git clone https://github.com/[org]/nextjs-clean-architecture-starter
cd nextjs-clean-architecture-starter
pnpm install

# Start services
pnpm db           # PostgreSQL
pnpm db:push      # Schema
pnpm dev          # Development

# Build your first feature
/eventstorming    # Discover domain
/feature-prd      # Generate spec
/gen-domain       # Create entities
/gen-usecase      # Create logic
/gen-tests        # Write tests
\`\`\`

## 🤖 AI-Powered Development

### Skills
| Skill | Purpose |
|-------|---------|
| `/eventstorming` | Discover domain events |
| `/feature-prd` | Generate PRD |
| `/gen-domain` | Scaffold domain layer |
| `/gen-usecase` | Scaffold application layer |
| `/gen-tests` | Generate BDD tests |

### Agents
| Agent | Purpose |
|-------|---------|
| `feature-architect` | Design feature architecture |
| `code-reviewer` | Review for quality |
| `test-writer` | Write comprehensive tests |
| `doc-writer` | Update documentation |

## 🏛️ Architecture

\`\`\`
src/
├── domain/           # Entities, VOs, Events
├── application/
│   ├── use-cases/    # Business logic
│   ├── ports/        # Interfaces
│   └── dto/          # Schemas
└── adapters/
    ├── controllers/  # HTTP handlers
    ├── repositories/ # DB implementations
    └── guards/       # Auth middleware
\`\`\`

## 📦 Packages

| Package | Description |
|---------|-------------|
| `ddd-kit` | DDD primitives |
| `@repo/ui` | Shared components |
| `@repo/drizzle` | Database schema |

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - AI development guide
- [Architecture](./docs/architecture.md) - Detailed architecture
- [Contributing](./CONTRIBUTING.md) - How to contribute

## 📄 License

MIT - See [LICENSE](./LICENSE)
```

## Definition of Done

- [ ] README written
- [ ] All sections complete
- [ ] Badges functional
- [ ] Links valid
