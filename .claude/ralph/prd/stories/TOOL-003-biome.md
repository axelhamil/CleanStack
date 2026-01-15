# TOOL-003: Configure Biome

## Story

**As a** developer
**I want** consistent linting and formatting with Biome
**So that** code style is uniform across the project

## Acceptance Criteria

- [x] Biome configured (may already exist)
- [x] `biome.json` has strict rules
- [x] npm scripts: `pnpm lint`, `pnpm format`, `pnpm fix`
- [x] Zero lint errors in codebase
- [x] Integrates with IDE (VSCode settings)

## Technical Notes

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" },
      "style": { "noNonNullAssertion": "warn" }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  }
}
```

## Definition of Done

- [x] Biome fully configured
- [x] All files pass lint check
- [x] Fix script auto-corrects issues
