# QA-002: E2E Tests Validation

## Story

En tant que développeur, je veux des tests E2E pour valider les parcours utilisateur critiques.

## Priority

Critical

## Acceptance Criteria

- [x] Tests Playwright configurés
- [x] Auth flow testé (sign up, sign in, sign out)
- [x] Protected routes testées
- [x] Billing flow testé
- [x] Tests peuvent tourner en local

## Note

Les tests E2E sont **volontairement retirés de la CI** pour des raisons de performance et de coût. Ils restent disponibles en local via `pnpm test:e2e`.

## Validation

```bash
pnpm test:e2e    # Run E2E tests locally
```

## Results

- Configuration: ✅ Playwright setup complet
- Auth tests: ✅ 5 tests
- Dashboard tests: ✅ 3 tests
- Billing tests: ✅ 3 tests
- Total: 11 tests E2E disponibles

## Status: ✅ COMPLET
