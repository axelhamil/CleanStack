# DX-004: Final Checklist

## Story

**As a** maintainer
**I want** a comprehensive release checklist
**So that** v1.0.0 meets quality standards

## Acceptance Criteria

- [ ] All code quality gates pass
- [ ] All features functional
- [ ] All AI tools working
- [ ] Documentation complete
- [ ] Ready for public release

## Technical Notes

### Code Quality Gates

```bash
# Run all quality checks
pnpm quality:full

# Individual checks
pnpm test           # All tests pass
pnpm type-check     # No type errors
pnpm lint           # No lint errors
pnpm jscpd          # < 3% duplication
pnpm knip           # No unused code
```

### Quality Checklist

```markdown
## Code Quality

### Tests
- [ ] All tests pass: `pnpm test`
- [ ] Coverage > 90%: `pnpm test:coverage`
- [ ] Domain tests complete
- [ ] UseCase tests complete (BDD)
- [ ] Repository tests complete

### Static Analysis
- [ ] Zero type errors: `pnpm type-check`
- [ ] Zero lint errors: `pnpm lint`
- [ ] Zero duplication: `pnpm jscpd`
- [ ] Zero unused code: `pnpm knip`

### Build
- [ ] Production build succeeds: `pnpm build`
- [ ] No build warnings
- [ ] Bundle size reasonable
```

### Feature Checklist

```markdown
## Features

### Authentication
- [ ] Email/password sign up
- [ ] Email/password sign in
- [ ] Sign out
- [ ] Email verification
- [ ] Password reset
- [ ] OAuth (Google)
- [ ] Protected routes
- [ ] Session management

### Billing (Stripe)
- [ ] Subscription domain model
- [ ] Stripe provider
- [ ] Checkout flow
- [ ] Webhook handling
- [ ] Customer portal
- [ ] Pricing page
- [ ] Plan selection

### UI
- [ ] Landing page
- [ ] Dashboard layout
- [ ] Settings pages
- [ ] Responsive design
- [ ] Dark mode (optional)

### Email
- [ ] Email provider setup
- [ ] Welcome template
- [ ] Password reset template
- [ ] Payment confirmation template
```

### AI Tools Checklist

```markdown
## AI Tools

### Skills (5)
- [ ] `/eventstorming` produces structured output
- [ ] `/feature-prd` generates PRD with acceptance criteria
- [ ] `/gen-domain` creates aggregate, VOs, events
- [ ] `/gen-usecase` creates use case, DTO, DI registration
- [ ] `/gen-tests` creates BDD tests

### Agents (4)
- [ ] `feature-architect` analyzes features correctly
- [ ] `code-reviewer` catches common issues
- [ ] `test-writer` generates valid tests
- [ ] `doc-writer` produces accurate docs

### CLAUDE.md
- [ ] Quick start section
- [ ] Workflow guides
- [ ] Skills reference
- [ ] Agents reference
- [ ] Templates
- [ ] Decision trees
- [ ] AI guidance
- [ ] Domain events guide
```

### Documentation Checklist

```markdown
## Documentation

### README.md
- [ ] Clear value proposition
- [ ] Quick start instructions
- [ ] Architecture overview
- [ ] Tech stack listed
- [ ] AI tools documented
- [ ] Contributing guide link
- [ ] License

### CHANGELOG.md
- [ ] v1.0.0 entry
- [ ] All features listed
- [ ] Breaking changes noted (if any)

### CLAUDE.md
- [ ] Complete and accurate
- [ ] Code examples work
- [ ] Patterns documented

### GitHub
- [ ] Issue templates
- [ ] PR template
- [ ] Contributing guide
- [ ] Code of conduct
```

### Release Checklist

```markdown
## Release Preparation

### Version
- [ ] package.json version: 1.0.0
- [ ] All workspace packages versioned
- [ ] CHANGELOG updated

### ddd-kit NPM
- [ ] Published to npm
- [ ] README accurate
- [ ] Types exported correctly
- [ ] No peer dep issues

### Repository
- [ ] Main branch clean
- [ ] No sensitive data
- [ ] .env.example up to date
- [ ] Docker compose works

### Final Validation
- [ ] Fresh clone works
- [ ] pnpm install succeeds
- [ ] pnpm db:push succeeds
- [ ] pnpm dev starts
- [ ] Auth flow works
- [ ] Stripe flow works (test mode)
- [ ] All skills work
- [ ] All agents work
```

### Pre-Release Script

```bash
#!/bin/bash
# scripts/pre-release.sh

echo "🔍 Running pre-release checks..."

echo "📦 Installing dependencies..."
pnpm install

echo "🗄️ Setting up database..."
pnpm db
sleep 5
pnpm db:push

echo "🧪 Running tests..."
pnpm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed"
  exit 1
fi

echo "📊 Checking coverage..."
pnpm test:coverage

echo "🔍 Type checking..."
pnpm type-check
if [ $? -ne 0 ]; then
  echo "❌ Type errors found"
  exit 1
fi

echo "🧹 Linting..."
pnpm lint
if [ $? -ne 0 ]; then
  echo "❌ Lint errors found"
  exit 1
fi

echo "📋 Checking duplication..."
pnpm jscpd
if [ $? -ne 0 ]; then
  echo "❌ Too much duplication"
  exit 1
fi

echo "🗑️ Checking unused code..."
pnpm knip
if [ $? -ne 0 ]; then
  echo "❌ Unused code found"
  exit 1
fi

echo "🏗️ Building..."
pnpm build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi

echo "✅ All pre-release checks passed!"
echo "🚀 Ready for v1.0.0 release"
```

### Post-Release

```markdown
## Post-Release

- [ ] Create GitHub release
- [ ] Tag v1.0.0
- [ ] Announce release
- [ ] Monitor issues
- [ ] Update demo (if any)
```

## Definition of Done

- [ ] All checklists completed
- [ ] Pre-release script passes
- [ ] v1.0.0 tagged
- [ ] Release published
