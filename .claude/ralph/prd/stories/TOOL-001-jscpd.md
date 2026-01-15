# TOOL-001: Setup jscpd

## Story

**As a** developer
**I want** code duplication detection with jscpd
**So that** I can maintain DRY principles and reduce technical debt

## Acceptance Criteria

- [ ] jscpd installed as dev dependency
- [ ] `.jscpd.json` config file created
- [ ] Threshold set to max 3% duplication
- [ ] Ignores: node_modules, dist, .next, coverage
- [ ] npm script: `pnpm check:duplication`
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

- [ ] Tool installed and configured
- [ ] Script runs successfully
- [ ] Current codebase passes check
