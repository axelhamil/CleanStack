# REL-002: CHANGELOG

## Story

**As a** user
**I want** a CHANGELOG
**So that** I can track version changes

## Acceptance Criteria

- [ ] CHANGELOG.md created
- [ ] Follows Keep a Changelog format
- [ ] Semantic versioning
- [ ] Categories: Added, Changed, Fixed, Removed

## Content

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - YYYY-MM-DD

### Added
- 🏛️ Clean Architecture structure with domain, application, adapters layers
- 📦 ddd-kit package with Result, Option, Entity, Aggregate, ValueObject
- 🔐 Authentication with BetterAuth (sign up, sign in, sign out, sessions)
- 💳 Stripe integration (checkout, webhooks, customer portal)
- 🎨 UI components with shadcn/ui and Tailwind 4
- 🤖 Claude Code skills: /eventstorming, /feature-prd, /gen-domain, /gen-usecase, /gen-tests
- 🤖 Claude Code agents: feature-architect, code-reviewer, test-writer, doc-writer
- 📧 Email templates with [provider]
- 🧪 BDD testing setup with Vitest
- 📊 90%+ test coverage
- 🔍 Quality tooling: jscpd, knip, biome, husky

### Infrastructure
- Monorepo with Turborepo
- PostgreSQL with Drizzle ORM
- GitHub Actions CI/CD
- Pre-commit hooks

### Documentation
- CLAUDE.md with AI development guide
- Professional README
- Architecture documentation

## [0.1.0] - YYYY-MM-DD

### Added
- Initial project structure
- Basic auth implementation
- ddd-kit primitives

---

[Unreleased]: https://github.com/[org]/[repo]/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/[org]/[repo]/releases/tag/v1.0.0
[0.1.0]: https://github.com/[org]/[repo]/releases/tag/v0.1.0
```

## Maintenance

Update CHANGELOG for each PR with:
- What was added/changed/fixed
- Link to PR if relevant
- Brief description

## Definition of Done

- [ ] CHANGELOG.md created
- [ ] Format correct
- [ ] v1.0.0 section ready
