# DX-005: Upgradable Architecture

## Story

**As a** developer who cloned the boilerplate
**I want** to easily update my project when the boilerplate is updated
**So that** I get bug fixes and new features without conflicts

## Acceptance Criteria

- [ ] Clear separation between "core packages" and "your code"
- [ ] npm packages for shared logic (updatable via `pnpm update`)
- [ ] Simple upgrade process (one command)
- [ ] Migration guides for breaking changes
- [ ] Zero complexity for day-to-day updates

## Technical Notes

### Philosophy: Keep It Simple

**La solution la plus simple qui couvre 99% des cas:**

1. **npm packages** = tout ce qui peut être updaté → `pnpm update @repo/*`
2. **Reference code** = exemples à copier, pas à importer
3. **Your code** = jamais touché par les updates

**Pas de:**
- ❌ Git remotes complexes
- ❌ Merge strategies
- ❌ Tracking branches
- ❌ CLI custom (overkill pour v1)

### Package Strategy

```
📦 npm packages (auto-update via pnpm):
├── @repo/ddd-kit           # Result, Option, Entity, Aggregate...
├── @repo/ui                # shadcn components
└── @repo/drizzle           # DB schema helpers

📁 Your project (never touched):
├── src/domain/             # YOUR domain entities
├── src/application/        # YOUR use cases
├── src/adapters/           # YOUR implementations
└── app/                    # YOUR pages

📚 Reference (copy if needed):
├── src/domain/user/        # Example aggregate
├── src/application/use-cases/auth/  # Example use cases
└── app/(auth)/             # Example pages
```

### Update Process

```bash
# 99% of updates = this single command
pnpm update @repo/ddd-kit @repo/ui @repo/drizzle

# Check what changed
pnpm outdated @repo/*
```

### Config Files

Pour les fichiers de config (biome.json, turbo.json), ils changent rarement.
Quand ils changent, on documente dans le CHANGELOG.

```bash
# Si le CHANGELOG indique un changement de config:
# 1. Regarder le diff sur GitHub
# 2. Copier-coller les changements pertinents
```

### CHANGELOG Format

```markdown
# Changelog

## [1.2.0] - 2024-XX-XX

### @repo/ddd-kit
- feat: Added `Result.combine()` method
- fix: Option.map() type inference

### @repo/ui
- feat: New DataTable component
- fix: Button focus ring

### Config Changes (manual)
> Copy these changes if you want them:
- `biome.json`: Added new lint rule `noUnusedImports`
- `turbo.json`: No changes

### Breaking Changes
- `IAuthProvider.signIn` signature changed (see migration below)

### Migration Guide
\`\`\`typescript
// Before
async signIn(user: User, password: Password): Promise<Result<AuthResponse>>

// After
async signIn(user: User, password: Password): Promise<Result<AuthSession>>
\`\`\`
```

### UPGRADING.md (Documentation)

```markdown
# Upgrading Your Project

## Quick Update (recommended)

\`\`\`bash
pnpm update @repo/ddd-kit @repo/ui @repo/drizzle
\`\`\`

That's it! Your code is never touched.

## What Gets Updated?

| Package | Contains | Auto-update? |
|---------|----------|--------------|
| @repo/ddd-kit | Result, Option, Entity... | ✅ Yes |
| @repo/ui | shadcn components | ✅ Yes |
| @repo/drizzle | DB helpers | ✅ Yes |
| Your domain code | Your entities | ❌ Never |
| Your app code | Your pages | ❌ Never |

## Breaking Changes

When there are breaking changes:
1. Check [CHANGELOG.md](./CHANGELOG.md)
2. Follow the migration guide
3. Update your code accordingly

## Config Updates (rare)

Config files (biome.json, turbo.json) rarely change.
When they do, the CHANGELOG will note it with:
- What changed
- How to apply it (usually copy-paste)

## Reference Code

The `src/domain/user/` and auth code are **examples**.
They're not packages - they're templates to learn from.

If the reference code improves:
1. Check the GitHub diff
2. Decide if you want the improvement
3. Manually apply to your code (or not)
```

### Version Tracking

Simple version file pour savoir quelle version tu utilises:

```json
// package.json - track boilerplate version
{
  "boilerplate": {
    "version": "1.0.0",
    "updated": "2024-01-15"
  }
}
```

### Semantic Versioning des Packages

```
MAJOR.MINOR.PATCH

PATCH (1.0.x) - Bug fixes, safe to update blindly
MINOR (1.x.0) - New features, backward compatible
MAJOR (x.0.0) - Breaking changes, read migration guide
```

## Definition of Done

- [ ] All shared code in npm packages
- [ ] UPGRADING.md guide written (simple)
- [ ] CHANGELOG format documented
- [ ] Reference vs Custom code clearly marked
- [ ] `pnpm update @repo/*` works smoothly
