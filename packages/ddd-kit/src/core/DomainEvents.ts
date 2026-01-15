import type { IDomainEvent } from "./DomainEvent";
import { None, type Option, Some } from "./Option";
import { Result } from "./Result";

/**
 * Enum for possible errors related to domain event handling.
 */
export enum DomainEventError {
  SUBSCRIPTION_FAILED = "SUBSCRIPTION_FAILED",
  REGISTRATION_FAILED = "REGISTRATION_FAILED",
  DISPATCH_FAILED = "DISPATCH_FAILED",
  HANDLER_FAILED = "HANDLER_FAILED",
  UNSUBSCRIPTION_FAILED = "UNSUBSCRIPTION_FAILED",
}

type EventHandler<T extends IDomainEvent = IDomainEvent> = (
  event: T,
) => Promise<Result<void>> | Result<void>;

type EventHandlers = {
  [key: string]: EventHandler[];
};

type Events = { [id: string]: IDomainEvent[] };

/**
 * Static domain events dispatcher.
 * Use for simple event dispatch without DI.
 */
export class DomainEvents {
  private static eventHandlers: EventHandlers = {};
  private static events: Events = {};
  private static enableLogging = true;

  // biome-ignore lint/complexity/noUselessConstructor: ByPassing the constructor
  constructor() {}

  public static setLogging(enabled: boolean): void {
    DomainEvents.enableLogging = enabled;
  }

  // biome-ignore lint/suspicious/noExplicitAny: Error is not typed
  private static log(message: string, error?: any): void {
    if (DomainEvents.enableLogging) {
      // biome-ignore lint/suspicious/noConsole: ByPassing the console
      console.error(message, error);
    }
  }

  public static subscribe<T extends IDomainEvent>(
    eventType: string,
    listener: EventHandler<T>,
  ): Result<void> {
    try {
      if (!DomainEvents.eventHandlers[eventType]) {
        DomainEvents.eventHandlers[eventType] = [];
      }

      DomainEvents.eventHandlers[eventType].push(listener as EventHandler);

      return Result.ok();
    } catch (_error) {
      return Result.fail(DomainEventError.SUBSCRIPTION_FAILED);
    }
  }

  public static unsubscribe(
    eventType: string,
    listener: EventHandler,
  ): Result<void> {
    try {
      const handlers = DomainEvents.eventHandlers[eventType];
      if (handlers) {
        const index = handlers.indexOf(listener);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
      return Result.ok();
    } catch (_error) {
      return Result.fail(DomainEventError.UNSUBSCRIPTION_FAILED);
    }
  }

  public static isSubscribed(eventType: string): boolean {
    const handlers = DomainEvents.eventHandlers[eventType];
    return handlers ? handlers.length > 0 : false;
  }

  public static registerEvent(
    entityId: string,
    event: IDomainEvent,
  ): Result<void> {
    try {
      if (!DomainEvents.events[entityId]) {
        DomainEvents.events[entityId] = [];
      }

      DomainEvents.events[entityId].push(event);
      return Result.ok();
    } catch (_error) {
      return Result.fail(DomainEventError.REGISTRATION_FAILED);
    }
  }

  public static async dispatch(entityId: string): Promise<Result<void>> {
    try {
      const eventsForEntity = DomainEvents.events[entityId];

      if (!eventsForEntity || eventsForEntity.length === 0) {
        return Result.ok();
      }

      const dispatchPromises: Promise<Result<void>>[] = [];

      for (const event of eventsForEntity) {
        const listeners = DomainEvents.eventHandlers[event.eventType] || [];

        for (const listener of listeners) {
          const result = listener(event);

          if (result instanceof Promise) {
            dispatchPromises.push(result);
          } else {
            if (result.isFailure) {
              DomainEvents.log(`Event handler failed: ${result.getError()}`);
            }
          }
        }
      }

      if (dispatchPromises.length > 0) {
        const results = await Promise.allSettled(dispatchPromises);

        for (const result of results) {
          if (result.status === "rejected") {
            DomainEvents.log("Event handler promise rejected:", result.reason);
          } else if (result.value.isFailure) {
            DomainEvents.log("Event handler failed:", result.value.getError());
          }
        }
      }

      delete DomainEvents.events[entityId];

      return Result.ok();
    } catch (error) {
      return Result.fail(`${DomainEventError.DISPATCH_FAILED}: ${error}`);
    }
  }

  public static async dispatchAll(): Promise<Result<void>> {
    try {
      const entityIds = Object.keys(DomainEvents.events);
      const dispatchPromises = entityIds.map((id) => DomainEvents.dispatch(id));

      await Promise.allSettled(dispatchPromises);

      return Result.ok();
    } catch (error) {
      return Result.fail(`${DomainEventError.DISPATCH_FAILED}: ${error}`);
    }
  }

  public static getEventsForEntity(entityId: string): Option<IDomainEvent[]> {
    const events = DomainEvents.events[entityId];
    return events ? Some.of(events) : None.of<IDomainEvent[]>();
  }

  public static clearEvents(): void {
    DomainEvents.events = {};
  }

  public static clearHandlers(): void {
    DomainEvents.eventHandlers = {};
  }

  public static getHandlerCount(eventType: string): number {
    const handlers = DomainEvents.eventHandlers[eventType];
    return handlers ? handlers.length : 0;
  }

  public static hasEvents(entityId: string): boolean {
    const events = DomainEvents.events[entityId];
    return events ? events.length > 0 : false;
  }

  public static getTotalEventCount(): number {
    return Object.values(DomainEvents.events).reduce(
      (total, events) => total + events.length,
      0,
    );
  }
}
