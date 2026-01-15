# Ralph Loop Prompt

You are working on: **nextjs-clean-architecture-starter** - The ultimate DDD boilerplate for AI-powered vibe coding.

## Mission

Transform this project into a production-ready v1.0.0 release with:
- 90% test coverage everywhere
- ddd-kit published on npm (via semantic-release)
- Full Claude skills & agents ecosystem
- DX level: Lovable but with superior code quality

## PRD Structure

```
.claude/ralph/prd/
├── index.md                    # Overview & acceptance criteria
├── epics/
│   ├── E0-tooling.md           # TOOL-* stories
│   ├── E1-ddd-kit.md           # DDD-* stories
│   ├── E2-domain-events.md     # EVT-* stories
│   ├── E3-skills.md            # SKL-* stories
│   ├── E4-agents.md            # AGT-* stories
│   ├── E5-claude-md.md         # DOC-* stories
│   ├── E6-docs.md              # REL-* stories
│   ├── E7-tests.md             # TST-* stories
│   ├── E8-starter.md           # FTR-* stories
│   ├── E9-dx.md                # DX-* stories
│   └── E10-qa.md               # QA-* stories (Final Review)
└── stories/                    # 81 User Stories (75 + 6 QA)
```

## Instructions

1. Read `.claude/ralph/prd/index.md` for overview and acceptance criteria
2. Read `.claude/ralph/PROGRESS.md` for current state and next story
3. Read `CLAUDE.md` for project conventions
4. Pick the **NEXT incomplete story** from the current Epic
5. Read the story file in `.claude/ralph/prd/stories/<story-id>.md`
6. Complete ALL acceptance criteria in the story
7. Update `PROGRESS.md` after EACH completed story
8. **ATOMIC COMMIT** after each story: `git add . && git commit -m "feat(<epic>): <story-title>"`
9. Run validation after changes:
   - `pnpm test`
   - `pnpm type-check`
   - `pnpm fix`
10. Output `<promise>PRODUCTION READY</promise>` when ALL epics completed

## Epic Order (Execute in this order!)

| Priority | Epic | Stories | Description |
|----------|------|---------|-------------|
| 1 | E0 | TOOL-001 to TOOL-006 | Tooling & CI foundation |
| 2 | E1 | DDD-001 to DDD-010 | ddd-kit tests & npm publish |
| 3 | E2 | EVT-001 to EVT-006 | Domain Events pattern |
| 4 | E7 | TST-001 to TST-007 | Test coverage (domain, app) |
| 5 | E3 | SKL-001 to SKL-006 | Claude Skills |
| 6 | E4 | AGT-001 to AGT-004 | Claude Agents |
| 7 | E5 | DOC-001 to DOC-008 | CLAUDE.md documentation |
| 8 | E8 | FTR-001 to FTR-017 | Starter Features |
| 9 | E6 | REL-001 to REL-006 | Docs & Release |
| 10 | E9 | DX-001 to DX-005 | DX Polish & Validation |
| 11 | E10 | QA-001 to QA-006 | QA & Final Review |

## Rules

### Commit Strategy
- **ONE COMMIT PER STORY** - atomic commits
- Format: `feat(<epic-code>): <story-title>` or `fix/test/docs/chore`
- Example: `feat(ddd): add Result tests (DDD-001)`
- Example: `test(tst): add User domain tests (TST-001)`

### Code Quality
- 90% test coverage minimum
- TDD/BDD approach for all new code
- Domain layer = zero external imports (only ddd-kit + Zod)
- Never throw in Domain/Application - use Result<T>
- Never null - use Option<T>
- No comments in code - self-documenting
- No index.ts barrels

### Testing
- BDD style: describe behavior, not implementation
- Mock at repository level
- Test all Result/Option states
- Name tests as behaviors

### Skills & Agents
- Skills go in `.claude/skills/`
- Agents go in `.claude/agents/`
- Follow Claude Code plugin format
- Test each skill/agent manually before marking complete

## Validation Checklist

Before marking ANY story complete:
- [ ] All acceptance criteria in story met
- [ ] Tests pass: `pnpm test`
- [ ] Types check: `pnpm type-check`
- [ ] Lint passes: `pnpm fix`
- [ ] Coverage maintained/improved
- [ ] No regressions
- [ ] Atomic commit made

## Completion Criteria

Output `<promise>PRODUCTION READY</promise>` ONLY when ALL of these are true:

### Code
- [ ] 90% test coverage on ddd-kit
- [ ] 90% test coverage on domain layer
- [ ] 90% test coverage on application layer
- [ ] Zero TypeScript errors
- [ ] Zero lint warnings

### Ecosystem
- [ ] All 6 skills created and functional
- [ ] All 4 agents created and functional
- [ ] CLAUDE.md fully refactored

### Publication
- [ ] ddd-kit ready for npm (build works, types export)
- [ ] semantic-release configured (auto-publish)
- [ ] README.md professional quality
- [ ] CHANGELOG.md auto-generated
- [ ] Vercel deployment working

### DX
- [ ] Clone → first feature workflow documented
- [ ] EventStorming → PRD automated via skill
- [ ] Ralph workflow optimized
- [ ] Upgradable architecture documented

### QA (E10 - Final Gate)
- [ ] Full codebase review completed
- [ ] E2E tests pass
- [ ] Documentation review completed
- [ ] Security review completed
- [ ] Performance validation passed
- [ ] Release checklist completed

### Starter Features
- [ ] Auth complete (all flows working)
- [ ] Stripe integration (checkout, webhooks, portal)
- [ ] Pricing page polished
- [ ] Dashboard layout responsive
- [ ] Landing page compelling
- [ ] Settings pages functional
- [ ] 90% coverage on billing domain
- [ ] Resend email setup

DO NOT output the completion promise until EVERY item above is checked.
