# DOC-002: Workflow Section

## Story

**As a** developer
**I want** a workflow guide in CLAUDE.md
**So that** I understand the full development process

## Acceptance Criteria

- [ ] EventStorming → Production workflow
- [ ] Each step explained
- [ ] Tools/skills for each step
- [ ] Visual diagram

## Content

```markdown
## Development Workflow

### The Vibe Coding Flow

\`\`\`
┌─────────────────┐
│  EventStorming  │  /eventstorming
│  (Discovery)    │  → Events, Commands, Aggregates
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Feature PRD   │  /feature-prd
│  (Specification)│  → Structured requirements
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
\`\`\`

### Step Details

#### 1. EventStorming
Interactive session with Claude to discover:
- Domain Events (what happened)
- Commands (what triggers events)
- Aggregates (who owns events)
- Policies (automatic reactions)

#### 2. Feature PRD
Structured document with:
- Domain model specification
- Use case definitions
- API contracts
- Test requirements

#### 3. Domain Layer
Generated files:
- `src/domain/{feature}/{feature}.aggregate.ts`
- `src/domain/{feature}/value-objects/*.vo.ts`
- `src/domain/{feature}/events/*.event.ts`

#### 4. Application Layer
Generated files:
- `src/application/use-cases/{feature}/*.use-case.ts`
- `src/application/dto/{feature}/*.dto.ts`
- `common/di/modules/{feature}.module.ts`

#### 5. Testing
Generated files:
- `src/application/use-cases/{feature}/__tests__/*.test.ts`

#### 6. Validation
Quality checks:
- `pnpm lint` - Code style
- `pnpm type-check` - TypeScript
- `pnpm test` - All tests
- `pnpm check:duplication` - No copy-paste
- `pnpm check:unused` - No dead code
```

## Definition of Done

- [ ] Section written
- [ ] Diagram clear
- [ ] Steps actionable
