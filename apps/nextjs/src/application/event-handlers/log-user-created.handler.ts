import { Result } from "@packages/ddd-kit";
import type { IEventHandler } from "@/application/ports/event-handler.port";
import type { UserCreatedEvent } from "@/domain/user/events/user-created.event";

export class LogUserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  readonly eventType = "user.created";

  async handle(event: UserCreatedEvent): Promise<Result<void>> {
    console.log(
      `[Event] User created: ${event.aggregateId} - ${event.payload.email}`,
    );
    return Result.ok();
  }
}
