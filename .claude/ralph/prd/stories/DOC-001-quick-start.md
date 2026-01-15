# DOC-001: Quick Start Section

## Story

**As a** new user
**I want** a quick start guide in CLAUDE.md
**So that** I can build my first feature in 5 minutes

## Acceptance Criteria

- [ ] Section at top of CLAUDE.md
- [ ] Clone → feature in 5 min
- [ ] Step-by-step instructions
- [ ] Links to relevant skills
- [ ] Example feature walkthrough

## Content

```markdown
## Quick Start

### 1. Setup (2 min)
\`\`\`bash
git clone [repo]
cd nextjs-clean-architecture-starter
pnpm install
pnpm db           # Start PostgreSQL
pnpm db:push      # Push schema
pnpm dev          # Start dev server
\`\`\`

### 2. Discover Your Domain (1 min)
\`\`\`
/eventstorming
\`\`\`
Tell Claude about your feature. Get structured domain output.

### 3. Generate PRD
\`\`\`
/feature-prd [paste EventStorming output]
\`\`\`

### 4. Generate Code
\`\`\`
/gen-domain [aggregate spec]
/gen-usecase [use case spec]
/gen-tests [use case name]
\`\`\`

### 5. Implement & Test
Claude writes the implementation. Run:
\`\`\`bash
pnpm test
pnpm check:all
\`\`\`

### Example: Add "Bookmark" Feature

1. `/eventstorming` → "Users can bookmark articles"
2. `/feature-prd` → Generate PRD
3. `/gen-domain Bookmark with userId, articleId, createdAt`
4. `/gen-usecase CreateBookmark`
5. `/gen-tests CreateBookmarkUseCase`
6. `pnpm test` → All green
```

## Definition of Done

- [ ] Section written
- [ ] Tested with fresh clone
- [ ] Links work
