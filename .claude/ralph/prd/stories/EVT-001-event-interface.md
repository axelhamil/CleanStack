# EVT-001: Event Interface Standard

## Story

**As a** developer
**I want** a standard DomainEvent interface
**So that** all events are consistent and typed

## Acceptance Criteria

- [ ] `IDomainEvent` interface defined in ddd-kit
- [ ] Properties: `dateOccurred`, `eventType`, `aggregateId`
- [ ] Generic type for payload
- [ ] Exported from ddd-kit

## Technical Notes

```typescript
// packages/ddd-kit/src/core/DomainEvent.ts
export interface IDomainEvent<T = unknown> {
  readonly eventType: string;
  readonly dateOccurred: Date;
  readonly aggregateId: string;
  readonly payload: T;
}

export abstract class DomainEvent<T = unknown> implements IDomainEvent<T> {
  readonly dateOccurred: Date;
  abstract readonly eventType: string;
  abstract readonly aggregateId: string;
  abstract readonly payload: T;

  constructor() {
    this.dateOccurred = new Date();
  }
}
```

### Example Event

```typescript
// src/domain/user/events/user-created.event.ts
export class UserCreatedEvent extends DomainEvent<{
  userId: string;
  email: string;
  name: string;
}> {
  readonly eventType = 'user.created';

  constructor(
    readonly aggregateId: string,
    readonly payload: { userId: string; email: string; name: string }
  ) {
    super();
  }
}
```

## Definition of Done

- [ ] Interface implemented
- [ ] Exported from ddd-kit
- [ ] Example event created
