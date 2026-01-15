# EVT-003: Event Handler Pattern

## Story

**As a** developer
**I want** a standard event handler pattern
**So that** side effects are organized consistently

## Acceptance Criteria

- [ ] `IEventHandler<T>` interface defined
- [ ] One handler per side effect
- [ ] Handlers registered at app startup
- [ ] Handlers can be async
- [ ] Example: `SendWelcomeEmailOnUserCreated`

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

- [ ] Handler interface created
- [ ] Example handler implemented
- [ ] Registration pattern documented
