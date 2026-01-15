import type { IDomainEvent, Result } from "@packages/ddd-kit";

export type EventHandler<T extends IDomainEvent = IDomainEvent> = (
  event: T,
) => Promise<Result<void>> | Result<void>;

export interface IEventDispatcher {
  subscribe<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): Result<void>;

  unsubscribe(eventType: string, handler: EventHandler): Result<void>;

  dispatch(event: IDomainEvent): Promise<Result<void>>;

  dispatchAll(events: IDomainEvent[]): Promise<Result<void>>;

  isSubscribed(eventType: string): boolean;

  getHandlerCount(eventType: string): number;

  clearHandlers(): void;
}
