# EVT-002: InMemoryEventDispatcher

## Story

**As a** developer
**I want** an in-memory event dispatcher
**So that** I can dispatch domain events without external dependencies

## Acceptance Criteria

- [x] `IEventDispatcher` interface defined
- [x] `InMemoryEventDispatcher` implementation
- [x] Subscribe by event type
- [x] Dispatch single event
- [x] Dispatch all events from aggregate
- [x] Handlers execute in order
- [x] Error in one handler doesn't break others

## Technical Notes

```typescript
// src/application/ports/event-dispatcher.port.ts
export interface IEventDispatcher {
  subscribe<T extends IDomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void> | void
  ): void;
  dispatch(event: IDomainEvent): Promise<void>;
  dispatchAll(events: IDomainEvent[]): Promise<void>;
}
```

```typescript
// src/adapters/events/in-memory-event-dispatcher.ts
export class InMemoryEventDispatcher implements IEventDispatcher {
  private handlers: Map<string, Array<(event: IDomainEvent) => Promise<void> | void>> = new Map();

  subscribe<T extends IDomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void> | void
  ): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler as any]);
  }

  async dispatch(event: IDomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.eventType}:`, error);
      }
    }
  }

  async dispatchAll(events: IDomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.dispatch(event);
    }
  }
}
```

## Definition of Done

- [x] Interface and implementation created
- [ ] Registered in DI container (will be done in EVT-004)
- [x] Tests pass (25 tests)
