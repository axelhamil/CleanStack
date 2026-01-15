# TOOL-005: npm Scripts Consolidation

## Story

**As a** developer
**I want** well-organized npm scripts
**So that** I can easily run common tasks

## Acceptance Criteria

- [x] All scripts documented in CLAUDE.md
- [x] Scripts follow naming convention
- [x] Composite scripts for common workflows
- [x] Scripts work from root (turbo) and app level

## Scripts to Define

```json
{
  "scripts": {
    // Development
    "dev": "turbo dev",
    "build": "turbo build",

    // Quality
    "lint": "biome lint .",
    "format": "biome format --write .",
    "fix": "biome check --apply .",
    "type-check": "turbo type-check",

    // Testing
    "test": "turbo test",
    "test:watch": "turbo test:watch",
    "test:coverage": "turbo test:coverage",

    // Checks
    "check:duplication": "jscpd .",
    "check:unused": "knip",
    "check:all": "pnpm lint && pnpm type-check && pnpm check:duplication && pnpm check:unused && pnpm test",

    // Database
    "db": "docker compose up -d",
    "db:push": "turbo db:push",
    "db:generate": "turbo db:generate",

    // UI
    "ui:add": "pnpm --filter @repo/ui ui:add"
  }
}
```

## Definition of Done

- [x] All scripts defined and working
- [x] Scripts documented
- [x] `pnpm check:all` passes
