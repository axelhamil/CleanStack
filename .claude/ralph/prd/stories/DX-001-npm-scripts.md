# DX-001: NPM Scripts Optimisés

## Story

**As a** developer
**I want** optimized npm scripts
**So that** common workflows are fast and intuitive

## Acceptance Criteria

- [ ] All scripts documented
- [ ] Scripts follow naming convention
- [ ] Parallel execution where possible
- [ ] Watch modes available
- [ ] CI-specific scripts

## Technical Notes

### Script Naming Convention

```
verb:target[:modifier]

Examples:
- dev           → Start development
- build         → Production build
- test          → Run tests
- test:watch    → Tests in watch mode
- lint          → Check only
- lint:fix      → Auto-fix
- db:push       → Push schema
- db:studio     → Open Drizzle Studio
```

### Optimized Scripts

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "type-check": "turbo type-check",

    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",

    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "fix": "pnpm lint:fix",

    "db": "docker compose up -d postgres",
    "db:push": "pnpm --filter @repo/drizzle db:push",
    "db:generate": "pnpm --filter @repo/drizzle db:generate",
    "db:migrate": "pnpm --filter @repo/drizzle db:migrate",
    "db:studio": "pnpm --filter @repo/drizzle db:studio",
    "db:seed": "pnpm --filter @repo/drizzle db:seed",

    "quality": "pnpm lint && pnpm type-check && pnpm test",
    "quality:full": "pnpm jscpd && pnpm knip && pnpm quality",

    "jscpd": "jscpd src --threshold 3",
    "knip": "knip",

    "ui:add": "pnpm --filter @repo/ui ui:add",

    "clean": "turbo clean && rm -rf node_modules",
    "preinstall": "npx only-allow pnpm"
  }
}
```

### Turbo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Package-Specific Scripts

```json
// apps/nextjs/package.json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  }
}

// packages/ddd-kit/package.json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### Quick Reference

```bash
# Development
pnpm dev              # Start all apps
pnpm db               # Start database

# Quality checks
pnpm fix              # Fix lint issues
pnpm quality          # Lint + types + tests
pnpm quality:full     # + jscpd + knip

# Database
pnpm db:push          # Push schema changes
pnpm db:studio        # Visual DB editor

# Testing
pnpm test             # Run once
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage

# UI
pnpm ui:add button    # Add shadcn component
```

## Definition of Done

- [ ] All scripts work
- [ ] Scripts documented in README
- [ ] Turbo caching works
- [ ] Watch modes function
