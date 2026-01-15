# TOOL-001: Setup jscpd

## Story

**As a** developer
**I want** code duplication detection with jscpd
**So that** I can maintain DRY principles and reduce technical debt

## Acceptance Criteria

- [x] jscpd installed as dev dependency
- [x] `.jscpd.json` config file created
- [x] Threshold set to max 3% duplication
- [x] Ignores: node_modules, dist, .next, coverage
- [x] npm script: `pnpm check:duplication`
- [ ] Fails CI if duplication > 3%

## Technical Notes

```bash
pnpm add -D jscpd
```

```json
// .jscpd.json
{
  "threshold": 3,
  "reporters": ["html", "console"],
  "ignore": ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**"],
  "format": ["typescript", "javascript"]
}
```

## Definition of Done

- [x] Tool installed and configured
- [x] Script runs successfully
- [x] Current codebase passes check (2.18% < 3%)
