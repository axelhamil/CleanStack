# E7: Tests Coverage Global

## Description

Atteindre 90% de test coverage sur tout le projet.

## Objectifs

- Domain layer > 90%
- Application layer > 90%
- ddd-kit > 90% (Epic E1)
- Coverage check dans CI

## Coverage Targets

| Layer | Current | Target |
|-------|---------|--------|
| ddd-kit | ~20% | 90%+ |
| Domain | 0% | 90%+ |
| Application | 0% | 90%+ |
| Adapters | 0% | 80%+ |

## Stories

| ID | Story | Priority |
|----|-------|----------|
| [TST-001](../stories/TST-001-domain-user.md) | Tests domain User | High |
| [TST-002](../stories/TST-002-domain-billing.md) | Tests domain Billing | High |
| [TST-003](../stories/TST-003-auth-usecases.md) | Tests auth use cases | High |
| [TST-004](../stories/TST-004-billing-usecases.md) | Tests billing use cases | High |
| [TST-005](../stories/TST-005-repositories.md) | Tests repositories | Medium |
| [TST-006](../stories/TST-006-coverage-ci.md) | Coverage dans CI | High |
| [TST-007](../stories/TST-007-playwright-e2e.md) | Playwright E2E tests | Medium |

## Test Strategy

### Domain
- Test chaque Aggregate (create, methods, events)
- Test chaque ValueObject (validation, equality)
- Test DomainEvents émis

### Application
- BDD style: "should X when Y"
- Mock repositories
- Test tous Result/Option states

### Adapters
- Integration tests avec test DB
- Mappers unit tests

## Acceptance Criteria

- [ ] Coverage global > 90%
- [ ] CI bloque si < 90%
- [ ] Badge coverage dans README
