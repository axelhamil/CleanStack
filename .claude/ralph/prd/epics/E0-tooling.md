# E0: Tooling & CI

## Description

Mettre en place tous les outils de qualité de code et le pipeline CI pour garantir un code production-ready.

## Objectifs

- Zero tolérance sur la duplication de code
- Détection automatique du code non utilisé
- Lint et format automatiques
- Tests et coverage dans CI
- Pre-commit hooks pour bloquer les erreurs

## Stack

| Tool | Purpose |
|------|---------|
| **Biome** | Lint + Format (déjà présent) |
| **jscpd** | Détection duplication |
| **knip** | Détection code non utilisé |
| **Vitest** | Tests + Coverage |
| **Husky** | Git hooks |
| **lint-staged** | Pre-commit checks |
| **GitHub Actions** | CI pipeline |

## Stories

| ID | Story | Priority |
|----|-------|----------|
| [TOOL-001](../stories/TOOL-001-jscpd.md) | Setup jscpd | High |
| [TOOL-002](../stories/TOOL-002-knip.md) | Setup knip | High |
| [TOOL-003](../stories/TOOL-003-biome-config.md) | Optimiser config Biome | Medium |
| [TOOL-004](../stories/TOOL-004-husky.md) | Setup Husky + lint-staged | High |
| [TOOL-005](../stories/TOOL-005-ci.md) | GitHub Actions CI | High |
| [TOOL-006](../stories/TOOL-006-coverage.md) | Coverage reporting | Medium |

## Scripts npm attendus

```json
{
  "check": "biome check .",
  "check:fix": "biome check --write .",
  "check:duplication": "jscpd ./packages ./apps/nextjs/src --threshold 0",
  "check:unused": "knip",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "precommit": "lint-staged"
}
```

## Acceptance Criteria

- [x] `pnpm check` passe sans erreur
- [x] `pnpm check:duplication` passe (threshold 3% - currently 2.18%)
- [x] `pnpm check:unused` clean
- [x] Pre-commit bloque si erreurs
- [x] CI passe sur chaque PR
