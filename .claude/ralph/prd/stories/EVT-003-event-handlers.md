# EVT-003: Event Handler Pattern

## Story

**As a** developer
**I want** a standard event handler pattern
**So that** side effects are organized consistently

## Acceptance Criteria

- [x] `IEventHandler<T>` interface defined
- [x] One handler per side effect
- [x] Handlers registered at app startup (EVT-004)
- [x] Handlers can be async
- [x] Example: `LogUserCreatedHandler` (email handler will come with FTR-014)

## Technical Notes

```typescript
// src/application/ports/event-handler.port.ts
export interface IEventHandler<T extends IDomainEvent> {
  readonly eventType: string;
  handle(event: T): Promise<void>;
}
```

```typescript
// src/application/event-handlers/send-welcome-email.handler.ts
export class SendWelcomeEmailOnUserCreated implements IEventHandler<UserCreatedEvent> {
  readonly eventType = 'user.created';

  constructor(private readonly emailService: IEmailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail({
      to: event.payload.email,
      name: event.payload.name,
    });
  }
}
```

### Registration Pattern

```typescript
// common/di/modules/events.module.ts
export const createEventsModule = () => {
  const m = createModule();

  // Register dispatcher
  m.bind(DI_SYMBOLS.IEventDispatcher).toClass(InMemoryEventDispatcher);

  // Register handlers
  m.bind(DI_SYMBOLS.SendWelcomeEmailHandler).toClass(
    SendWelcomeEmailOnUserCreated,
    [DI_SYMBOLS.IEmailService]
  );

  return m;
};

// common/di/event-subscriptions.ts
export function registerEventHandlers(dispatcher: IEventDispatcher) {
  const welcomeHandler = getInjection('SendWelcomeEmailHandler');
  dispatcher.subscribe(welcomeHandler.eventType, (e) => welcomeHandler.handle(e));
}
```

## Definition of Done

- [x] Handler interface created
- [x] Example handler implemented (LogUserCreatedHandler)
- [x] Registration pattern documented (EVT-004)
- [x] Tests pass (3 tests)
