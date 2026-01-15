# Upgrading Your Project

This guide explains how to keep your project up to date with the latest boilerplate improvements.

## Quick Update

```bash
# Update all @packages/* dependencies
pnpm update @packages/ddd-kit @packages/ui @packages/drizzle
```

That's it for most updates. Your custom code is never touched.

## What Gets Updated?

| Package | Contains | Auto-update? |
|---------|----------|--------------|
| `@packages/ddd-kit` | Result, Option, Entity, Aggregate, ValueObject | Yes |
| `@packages/ui` | shadcn/ui components | Yes |
| `@packages/drizzle` | Database schema helpers | Yes |
| Your domain code | Your entities, VOs, events | Never |
| Your app code | Your pages, components | Never |

## Understanding the Structure

```
packages/              # Updatable via pnpm
├── ddd-kit/           # DDD primitives
├── ui/                # UI components
└── drizzle/           # DB schema

apps/nextjs/src/       # YOUR CODE (never touched)
├── domain/            # Your domain entities
├── application/       # Your use cases
└── adapters/          # Your implementations

Reference code:        # Examples to learn from
├── domain/user/       # Example aggregate
├── use-cases/auth/    # Example use cases
└── app/(auth)/        # Example pages
```

## Version Tracking

Check your current versions:

```bash
pnpm list @packages/ddd-kit @packages/ui @packages/drizzle
```

Check for available updates:

```bash
pnpm outdated @packages/*
```

## Breaking Changes

When there are breaking changes:

1. Check [CHANGELOG.md](./CHANGELOG.md) for the version
2. Look for the "Breaking Changes" section
3. Follow the migration guide provided

### Example Migration

```typescript
// Before (v0.x)
async signIn(user: User, password: Password): Promise<Result<AuthResponse>>

// After (v1.x)
async signIn(user: User, password: Password): Promise<Result<AuthSession>>
```

## Config File Updates

Config files (`biome.json`, `turbo.json`, `tsconfig.json`) rarely change.

When they do:
1. The CHANGELOG will note what changed
2. Review the diff on GitHub
3. Manually apply changes you want

## Reference Code Updates

The reference implementation (`domain/user/`, `use-cases/auth/`) may improve over time.

To benefit from improvements:
1. Check the GitHub diff for changes
2. Decide if you want the improvement
3. Manually apply to your code

These are templates to learn from, not dependencies.

## Semantic Versioning

```
MAJOR.MINOR.PATCH

PATCH (1.0.x) - Bug fixes, safe to update without checking
MINOR (1.x.0) - New features, backward compatible
MAJOR (x.0.0) - Breaking changes, read migration guide first
```

## Recommended Update Schedule

- **Weekly**: Run `pnpm outdated @packages/*` to check for updates
- **Before new features**: Update to latest to get bug fixes
- **Major versions**: Read the migration guide before updating

## Troubleshooting

### Update fails with peer dependency error

```bash
pnpm update @packages/ddd-kit --force
```

### Type errors after update

```bash
# Restart TypeScript server
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"

# Or rebuild
pnpm build
```

### Breaking change not documented

Open an issue on GitHub with:
- Previous version
- New version
- Error message
