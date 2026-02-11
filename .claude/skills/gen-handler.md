---
name: gen-handler
description: Generate domain event handlers with IEventHandler interface and DI registration
---

# Event Handler Generator

Generate production-ready domain event handlers following the Clean Architecture pattern. Handlers react to domain events and execute side effects (emails, notifications, external calls).

Reference: `src/application/event-handlers/`

## Architecture Overview

```
Aggregate.create()
    │
    ▼
addEvent(DomainEvent)
    │
    ▼
repository.save()  ──────► DB
    │
    │ (on success only)
    ▼
eventDispatcher.dispatchAll()
    │
    ▼
Handler 1 ──► Send email
Handler 2 ──► Update stats
Handler 3 ──► Notify external service
```

## Input

Event handler specification:
- Event to handle (e.g., `UserCreatedEvent`)
- Handler action (e.g., `SendWelcomeEmail`)
- Dependencies needed (email service, external API, etc.)

## Output Files

### 1. Simple Handler (no dependencies)
`src/application/event-handlers/{action-name}.handler.ts`

```typescript
import { Result } from "@packages/ddd-kit";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { {EventName}Event } from "@/domain/{aggregate}/events/{event-name}.event";

export class {ActionName}Handler implements IEventHandler<{EventName}Event> {
  readonly eventType = "{aggregate}.{action}";

  async handle(event: {EventName}Event): Promise<Result<void>> {
    // Log or simple processing
    console.log(
      `[Event] {EventName} triggered:`,
      {
        aggregateId: event.aggregateId,
        payload: event.payload,
        occurredAt: event.occurredAt,
      },
    );

    return Result.ok();
  }
}
```

### 2. Handler with Dependencies
`src/application/event-handlers/{action-name}.handler.ts`

```typescript
import { Result } from "@packages/ddd-kit";
import type { I{ServiceName}Service } from "@/application/ports/{service-name}.service.port";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { {EventName}Event } from "@/domain/{aggregate}/events/{event-name}.event";
import { render{TemplateName} } from "@/emails/templates/{template-name}";

export class {ActionName}Handler implements IEventHandler<{EventName}Event> {
  readonly eventType = "{aggregate}.{action}";

  constructor(
    private readonly {serviceName}: I{ServiceName}Service,
  ) {}

  async handle(event: {EventName}Event): Promise<Result<void>> {
    // 1. Prepare data from event payload
    const { email, name, data } = event.payload;

    // 2. Render template (if email)
    const html = await render{TemplateName}({
      name,
      data,
    });

    // 3. Execute side effect
    const result = await this.{serviceName}.send({
      to: email,
      subject: "Subject for {EventName}",
      html,
      text: `Plain text fallback for ${name}`,
    });

    // 4. Return Result
    if (result.isFailure) {
      console.error(`[{ActionName}Handler] Failed:`, result.getError());
      return result;
    }

    console.log(`[{ActionName}Handler] Success for:`, event.aggregateId);
    return Result.ok();
  }
}
```

### 3. Handler with External API Call
`src/application/event-handlers/{action-name}.handler.ts`

```typescript
import { Result } from "@packages/ddd-kit";
import type { I{ExternalService}Client } from "@/application/ports/{external-service}.client.port";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { {EventName}Event } from "@/domain/{aggregate}/events/{event-name}.event";

export class {ActionName}Handler implements IEventHandler<{EventName}Event> {
  readonly eventType = "{aggregate}.{action}";

  constructor(
    private readonly {externalService}Client: I{ExternalService}Client,
  ) {}

  async handle(event: {EventName}Event): Promise<Result<void>> {
    try {
      // Call external service
      const result = await this.{externalService}Client.notify({
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        payload: event.payload,
        occurredAt: event.occurredAt.toISOString(),
      });

      if (result.isFailure) {
        // Log but don't fail - external service issues shouldn't block
        console.error(
          `[{ActionName}Handler] External call failed:`,
          result.getError(),
        );
        // Optionally: queue for retry
      }

      return Result.ok();
    } catch (error) {
      console.error(`[{ActionName}Handler] Unexpected error:`, error);
      return Result.fail(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
}
```

### 4. Handler with Repository Access
`src/application/event-handlers/{action-name}.handler.ts`

```typescript
import { match, Result } from "@packages/ddd-kit";
import type { I{Entity}Repository } from "@/application/ports/{entity}.repository.port";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { {EventName}Event } from "@/domain/{aggregate}/events/{event-name}.event";

export class {ActionName}Handler implements IEventHandler<{EventName}Event> {
  readonly eventType = "{aggregate}.{action}";

  constructor(
    private readonly {entity}Repo: I{Entity}Repository,
  ) {}

  async handle(event: {EventName}Event): Promise<Result<void>> {
    // 1. Fetch related entity
    const findResult = await this.{entity}Repo.findById(event.payload.{entity}Id);

    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    return match(findResult.getValue(), {
      Some: async (entity) => {
        // 2. Update entity based on event
        entity.updateFromEvent(event.payload);

        // 3. Save changes
        const saveResult = await this.{entity}Repo.update(entity);
        if (saveResult.isFailure) {
          return Result.fail(saveResult.getError());
        }

        return Result.ok();
      },
      None: () => {
        // Entity not found - log and continue
        console.warn(
          `[{ActionName}Handler] Entity not found:`,
          event.payload.{entity}Id,
        );
        return Result.ok();
      },
    });
  }
}
```

### 5. DI Registration
`common/di/modules/events.module.ts`

```typescript
import { createModule } from "@evyweb/ioctopus";
import { InMemoryEventDispatcher } from "@/adapters/events/in-memory-event-dispatcher";
import { {ActionName}Handler } from "@/application/event-handlers/{action-name}.handler";
import type { I{ServiceName}Service } from "@/application/ports/{service-name}.service.port";
import type { {EventName}Event } from "@/domain/{aggregate}/events/{event-name}.event";
import { DI_SYMBOLS } from "../types";

export const createEventsModule = () => {
  const eventsModule = createModule();
  eventsModule
    .bind(DI_SYMBOLS.IEventDispatcher)
    .toClass(InMemoryEventDispatcher);
  return eventsModule;
};

export const registerEventHandlers = (
  dispatcher: InMemoryEventDispatcher,
  {serviceName}: I{ServiceName}Service,
  // Add other dependencies as needed
): void => {
  // Register handler with dependencies
  const {actionName}Handler = new {ActionName}Handler({serviceName});
  dispatcher.subscribe<{EventName}Event>(
    {actionName}Handler.eventType,
    (event) => {actionName}Handler.handle(event),
  );

  // Register additional handlers for same event
  const loggingHandler = new Log{EventName}Handler();
  dispatcher.subscribe<{EventName}Event>(
    loggingHandler.eventType,
    (event) => loggingHandler.handle(event),
  );
};
```

## File Structure

```
src/application/
├── event-handlers/
│   ├── send-welcome-email.handler.ts
│   ├── log-user-created.handler.ts
│   ├── notify-slack-on-order.handler.ts
│   ├── update-stats-on-purchase.handler.ts
│   └── {action-name}.handler.ts
└── ports/
    └── event-handler.port.ts
```

## Event Handler Port Interface

```typescript
// src/application/ports/event-handler.port.ts
import type { IDomainEvent, Result } from "@packages/ddd-kit";

export interface IEventHandler<T extends IDomainEvent = IDomainEvent> {
  readonly eventType: string;
  handle(event: T): Promise<Result<void>>;
}
```

## Naming Conventions

| Event | Handler | Purpose |
|-------|---------|---------|
| `UserCreatedEvent` | `SendWelcomeEmailHandler` | Send welcome email |
| `UserCreatedEvent` | `LogUserCreatedHandler` | Audit logging |
| `OrderPlacedEvent` | `NotifySlackOnOrderHandler` | Slack notification |
| `OrderPlacedEvent` | `UpdateInventoryHandler` | Decrement stock |
| `PaymentFailedEvent` | `SendPaymentFailedEmailHandler` | Alert user |
| `SubscriptionCancelledEvent` | `RevokeAccessHandler` | Remove permissions |

## Best Practices

1. **Idempotency** - Handlers should be safe to retry
2. **Error isolation** - One handler failure shouldn't block others
3. **No side effect chains** - Handlers don't emit new events
4. **Result<void>** - Always return Result for error tracking
5. **Logging** - Log handler execution for debugging
6. **Dependencies** - Inject via constructor, never direct imports
7. **Async** - All handlers are async
8. **Event payload** - Use event payload, don't re-fetch aggregate

## Handler Patterns

### Fire-and-Forget (non-critical)
```typescript
async handle(event: Event): Promise<Result<void>> {
  try {
    await this.externalService.notify(event.payload);
  } catch (error) {
    console.error("[Handler] Failed, but continuing:", error);
  }
  return Result.ok(); // Always succeed for non-critical
}
```

### Critical (must succeed)
```typescript
async handle(event: Event): Promise<Result<void>> {
  const result = await this.criticalService.execute(event.payload);
  if (result.isFailure) {
    // This will be logged and could trigger retry logic
    return Result.fail(result.getError());
  }
  return Result.ok();
}
```

### With Retry Logic
```typescript
async handle(event: Event): Promise<Result<void>> {
  const maxRetries = 3;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await this.service.execute(event.payload);
    if (result.isSuccess) {
      return Result.ok();
    }
    lastError = result.getError();
    await this.delay(attempt * 1000); // Exponential backoff
  }

  return Result.fail(`Failed after ${maxRetries} attempts: ${lastError}`);
}

private delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## Example Usage

```
/gen-handler SendWelcomeEmail for UserCreatedEvent:
- Dependencies: IEmailService
- Action: Render welcome template, send via email service
```

```
/gen-handler NotifySlackOnOrder for OrderPlacedEvent:
- Dependencies: ISlackClient
- Action: Post message to #orders channel with order details
```

```
/gen-handler UpdateUserStats for PurchaseCompletedEvent:
- Dependencies: IUserStatsRepository
- Action: Increment total purchases, update last purchase date
```
