import { createModule } from "@evyweb/ioctopus";
import { InMemoryEventDispatcher } from "@/adapters/events/in-memory-event-dispatcher";
import { LogUserCreatedHandler } from "@/application/event-handlers/log-user-created.handler";
import type { UserCreatedEvent } from "@/domain/user/events/user-created.event";
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
): void => {
  const logHandler = new LogUserCreatedHandler();
  dispatcher.subscribe<UserCreatedEvent>(logHandler.eventType, (event) =>
    logHandler.handle(event),
  );
};
