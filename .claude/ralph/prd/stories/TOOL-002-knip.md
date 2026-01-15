# TOOL-002: Setup knip

## Story

**As a** developer
**I want** unused code detection with knip
**So that** I can keep the codebase clean and remove dead code

## Acceptance Criteria

- [x] knip installed as dev dependency
- [x] `knip.json` config file created
- [x] Configured for monorepo structure
- [x] npm script: `pnpm check:unused`
- [x] Reports unused: files, exports, dependencies, types
- [ ] Fails CI if unused code detected

## Technical Notes

```bash
pnpm add -D knip
```

```json
// knip.json
{
  "workspaces": {
    "apps/nextjs": {
      "entry": ["app/**/*.tsx", "src/**/*.ts"],
      "project": ["**/*.ts", "**/*.tsx"]
    },
    "packages/ddd-kit": {
      "entry": ["src/index.ts"],
      "project": ["src/**/*.ts"]
    }
  },
  "ignore": ["**/*.test.ts", "**/*.spec.ts"]
}
```

## Definition of Done

- [x] Tool installed and configured
- [x] Script runs successfully
- [x] All unused code identified and removed
