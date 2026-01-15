# TOOL-003: Configure Biome

## Story

**As a** developer
**I want** consistent linting and formatting with Biome
**So that** code style is uniform across the project

## Acceptance Criteria

- [ ] Biome configured (may already exist)
- [ ] `biome.json` has strict rules
- [ ] npm scripts: `pnpm lint`, `pnpm format`, `pnpm fix`
- [ ] Zero lint errors in codebase
- [ ] Integrates with IDE (VSCode settings)

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

- [ ] Biome fully configured
- [ ] All files pass lint check
- [ ] Fix script auto-corrects issues
