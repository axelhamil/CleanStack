# REL-005: v1.0.0 Release

## Story

**As a** maintainer
**I want** to release v1.0.0
**So that** users can use a stable version

## Acceptance Criteria

- [ ] All acceptance criteria from other epics met
- [ ] Version bumped to 1.0.0
- [ ] Git tag created
- [ ] GitHub Release created
- [ ] Release notes written

## Pre-Release Checklist

### Code Quality
- [ ] `pnpm lint` passes
- [ ] `pnpm type-check` passes
- [ ] `pnpm test` passes
- [ ] `pnpm check:duplication` passes (< 3%)
- [ ] `pnpm check:unused` passes
- [ ] `pnpm build` succeeds
- [ ] Coverage > 90%

### Features
- [ ] Auth complete (sign up, sign in, sign out, sessions)
- [ ] Stripe integration working
- [ ] UI components polished
- [ ] Responsive design

### Documentation
- [ ] README complete
- [ ] CLAUDE.md complete
- [ ] CHANGELOG updated
- [ ] API documented

### AI Tooling
- [ ] All 5 skills working
- [ ] All 4 agents working
- [ ] Workflow tested E2E

## Release Steps

```bash
# 1. Ensure everything passes
pnpm check:all
pnpm build

# 2. Update version in package.json files
# packages/ddd-kit/package.json
# apps/nextjs/package.json (if versioned)

# 3. Update CHANGELOG
# Add release date to [1.0.0] section

# 4. Commit version bump
git add .
git commit -m "chore: release v1.0.0"

# 5. Create and push tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# 6. Create GitHub Release
# Go to GitHub > Releases > Create new release
# Select tag v1.0.0
# Add release notes (copy from CHANGELOG)
# Publish release
```

## Release Notes Template

```markdown
# 🎉 v1.0.0 - Initial Release

The first stable release of Next.js Clean Architecture Starter!

## Highlights

- 🏛️ **Clean Architecture** - Production-ready layered architecture
- 📦 **ddd-kit** - DDD primitives package
- 🤖 **AI-Powered** - Skills and agents for Claude Code
- 🔐 **Auth Ready** - BetterAuth integration
- 💳 **Payments** - Stripe integration
- 🧪 **90%+ Coverage** - Comprehensive test suite

## Quick Start

\`\`\`bash
git clone https://github.com/[org]/nextjs-clean-architecture-starter
cd nextjs-clean-architecture-starter
pnpm install && pnpm dev
\`\`\`

## What's Included

See [CHANGELOG](./CHANGELOG.md) for full details.

## Breaking Changes

None - this is the initial release.

## Contributors

Thanks to everyone who contributed!
```

## Definition of Done

- [ ] All checks pass
- [ ] Version 1.0.0 in package.json
- [ ] Tag created
- [ ] GitHub Release published
