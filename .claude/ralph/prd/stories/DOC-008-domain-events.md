# DOC-008: Domain Events Section

## Story

**As a** developer
**I want** domain events documentation in CLAUDE.md
**So that** I understand the event system

## Acceptance Criteria

- [ ] Event creation pattern
- [ ] Dispatch timing (after save)
- [ ] Handler registration
- [ ] Example complete flow

## Content

```markdown
## Domain Events

### Overview

Domain events capture significant business state changes. They enable:
- Loose coupling between components
- Side effects (emails, notifications)
- Audit logging
- Event-driven workflows

### Event Structure

\`\`\`typescript
// src/domain/user/events/user-created.event.ts
export class UserCreatedEvent extends DomainEvent<{
  userId: string;
  email: string;
  name: string;
}> {
  readonly eventType = "user.created";

  constructor(user: User) {
    super();
    this.aggregateId = user.id.value;
    this.payload = {
      userId: user.id.value,
      email: user.email.value,
      name: user.name.value,
    };
  }
}
\`\`\`

### Emitting Events

Events are added in aggregate methods, NOT dispatched:

\`\`\`typescript
// In aggregate
static create(props: CreateProps): User {
  const user = new User({ ...props, createdAt: new Date() }, new UUID());
  user.addEvent(new UserCreatedEvent(user)); // Added, not dispatched!
  return user;
}

verifyEmail(): void {
  this._props.emailVerified = true;
  this.addEvent(new UserEmailVerifiedEvent(this));
}
\`\`\`

### Dispatching Events

**CRITICAL:** Events dispatch AFTER successful persistence:

\`\`\`typescript
// In use case
async execute(input: Input): Promise<Result<Output>> {
  // 1. Create aggregate (events added internally)
  const user = User.create(props);

  // 2. Persist FIRST
  const saveResult = await this.userRepo.create(user);
  if (saveResult.isFailure) {
    return Result.fail(saveResult.getError());
    // Events NOT dispatched on failure!
  }

  // 3. Dispatch AFTER save succeeds
  await this.eventDispatcher.dispatchAll(user.domainEvents);
  user.clearEvents();

  return Result.ok(dto);
}
\`\`\`

### Event Handlers

\`\`\`typescript
// src/application/event-handlers/send-welcome-email.handler.ts
export class SendWelcomeEmailHandler implements IEventHandler<UserCreatedEvent> {
  readonly eventType = "user.created";

  constructor(private readonly emailService: IEmailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail({
      to: event.payload.email,
      name: event.payload.name,
    });
  }
}
\`\`\`

### Registration

\`\`\`typescript
// common/di/event-subscriptions.ts
export function registerEventHandlers(dispatcher: IEventDispatcher) {
  const handler = getInjection("SendWelcomeEmailHandler");
  dispatcher.subscribe(handler.eventType, (e) => handler.handle(e));
}
\`\`\`

### Flow Diagram

\`\`\`
User.create()
    │
    ▼
addEvent(UserCreatedEvent)
    │
    ▼
userRepo.create(user)  ──────► DB Insert
    │
    │ (on success)
    ▼
eventDispatcher.dispatchAll()
    │
    ▼
SendWelcomeEmailHandler.handle()
    │
    ▼
emailService.sendWelcomeEmail()
\`\`\`

### Best Practices

1. **Event naming:** Past tense (UserCreated, OrderPlaced)
2. **Payload:** Include all data handlers need (avoid lookups)
3. **Idempotency:** Handlers should be safe to retry
4. **Error isolation:** One handler failure shouldn't block others
5. **Testing:** Verify events emitted and handlers called
```

## Definition of Done

- [ ] Section written
- [ ] Pattern clear
- [ ] Examples complete
