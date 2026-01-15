# E2: Domain Events Pattern

## Description

Implémenter un pattern simple et framework-agnostic pour l'exécution des domain events.

## Objectifs

- Pattern clair documenté
- IEventDispatcher port
- InMemoryEventDispatcher adapter
- Exemple fonctionnel
- Tests complets

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│   UseCase   │────▶│  EventDispatcher │────▶│ EventHandler  │
└─────────────┘     └──────────────────┘     └───────────────┘
       │                     │
       ▼                     ▼
  Repository            DomainEvents
    .save()               (ddd-kit)
```

**Pattern**: Dispatch après `repository.save()` réussi dans le Use Case.

## Stories

| ID | Story | Priority |
|----|-------|----------|
| [EVT-001](../stories/EVT-001-dispatcher-port.md) | IEventDispatcher port | High |
| [EVT-002](../stories/EVT-002-dispatcher-impl.md) | InMemoryEventDispatcher | High |
| [EVT-003](../stories/EVT-003-handler-interface.md) | IEventHandler interface | High |
| [EVT-004](../stories/EVT-004-di-wiring.md) | DI wiring | High |
| [EVT-005](../stories/EVT-005-example-handler.md) | Example handler | Medium |
| [EVT-006](../stories/EVT-006-tests.md) | Tests integration | High |

## Acceptance Criteria

- [ ] Pattern documenté dans CLAUDE.md
- [ ] IEventDispatcher dans application/ports
- [ ] InMemoryEventDispatcher fonctionnel
- [ ] DI configuré
- [ ] Tests > 90% coverage
- [ ] Exemple UseCase avec events
