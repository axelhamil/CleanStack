# E2: Domain Events Pattern ✅

**Status:** COMPLET (95%)
**Dernière mise à jour:** Janvier 2025

## Description

Implémenter un pattern simple et framework-agnostic pour l'exécution des domain events.

## Objectifs

- ✅ Pattern clair documenté
- ✅ IEventDispatcher port
- ✅ InMemoryEventDispatcher adapter
- ✅ Exemple fonctionnel
- ✅ Tests complets

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

## Implémentation Détaillée

### Ports (application/ports/)
| Fichier | Description |
|---------|-------------|
| `event-dispatcher.port.ts` | Interface `IEventDispatcher` avec méthode `dispatch(events: DomainEvent[])` |
| `event-handler.port.ts` | Interface `IEventHandler<T>` avec méthode `handle(event: T)` |

### Adapter (adapters/events/)
| Fichier | Description |
|---------|-------------|
| `in-memory-event-dispatcher.ts` | Implémentation synchrone pour dev/test. Route les events vers les handlers enregistrés. |

### Event Handlers (application/event-handlers/)
| Handler | Event | Action |
|---------|-------|--------|
| `log-user-created.handler.ts` | UserCreatedEvent | Log structuré pour audit |
| `send-welcome-email.handler.ts` | UserCreatedEvent | Envoi email via IEmailService |

### Domain Events Implémentés

#### User Events (domain/user/events/)
| Event | Payload | Trigger |
|-------|---------|---------|
| `UserCreatedEvent` | `{ userId, email, name }` | SignUpUseCase |
| `UserVerifiedEvent` | `{ userId, verifiedAt }` | VerifyEmailUseCase |
| `UserSignedInEvent` | `{ userId, method, ip }` | SignInUseCase |

#### Billing Events (domain/billing/events/)
| Event | Payload | Trigger |
|-------|---------|---------|
| `SubscriptionCreatedEvent` | `{ subscriptionId, userId, planId }` | HandleStripeWebhook |
| `SubscriptionCancelledEvent` | `{ subscriptionId, reason }` | HandleStripeWebhook |
| `SubscriptionRenewedEvent` | `{ subscriptionId, period }` | HandleStripeWebhook |
| `PlanChangedEvent` | `{ subscriptionId, oldPlan, newPlan }` | HandleStripeWebhook |
| `PaymentFailedEvent` | `{ subscriptionId, amount, error }` | HandleStripeWebhook |

## Stories

| ID | Story | Priority | Status |
|----|-------|----------|--------|
| [EVT-001](../stories/EVT-001-dispatcher-port.md) | IEventDispatcher port | High | ✅ |
| [EVT-002](../stories/EVT-002-dispatcher-impl.md) | InMemoryEventDispatcher | High | ✅ |
| [EVT-003](../stories/EVT-003-handler-interface.md) | IEventHandler interface | High | ✅ |
| [EVT-004](../stories/EVT-004-di-wiring.md) | DI wiring | High | ✅ |
| [EVT-005](../stories/EVT-005-example-handler.md) | Example handler | Medium | ✅ |
| [EVT-006](../stories/EVT-006-tests.md) | Tests integration | High | ✅ |

## Acceptance Criteria

- [x] Pattern documenté dans CLAUDE.md
- [x] IEventDispatcher dans application/ports
- [x] InMemoryEventDispatcher fonctionnel
- [x] DI configuré
- [x] Tests > 90% coverage (packages/ddd-kit 92%)
- [x] Exemple UseCase avec events (SignUp, Billing)

## Notes Techniques

### Usage dans un UseCase
```typescript
// Après repository.save() réussi
const events = user.domainEvents;
user.clearEvents();
await this.eventDispatcher.dispatch(events);
```

### Extension Future
- [ ] Async event dispatcher (queue-based)
- [ ] Event sourcing adapter
- [ ] Outbox pattern pour garantir delivery
