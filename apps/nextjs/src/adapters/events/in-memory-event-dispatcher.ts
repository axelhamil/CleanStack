import type { IDomainEvent } from "@packages/ddd-kit";
import { Result } from "@packages/ddd-kit";
import type {
  EventHandler,
  IEventDispatcher,
} from "@/application/ports/event-dispatcher.port";

type HandlersMap = Map<string, EventHandler[]>;

export class InMemoryEventDispatcher implements IEventDispatcher {
  private handlers: HandlersMap = new Map();
  private enableLogging = false;

  setLogging(enabled: boolean): void {
    this.enableLogging = enabled;
  }

  private log(message: string, error?: unknown): void {
    if (this.enableLogging) {
      console.error(message, error);
    }
  }

  subscribe<T extends IDomainEvent>(
    eventType: string,
    handler: EventHandler<T>,
  ): Result<void> {
    try {
      const existing = this.handlers.get(eventType) ?? [];
      this.handlers.set(eventType, [...existing, handler as EventHandler]);
      return Result.ok();
    } catch (_error) {
      return Result.fail("SUBSCRIPTION_FAILED");
    }
  }

  unsubscribe(eventType: string, handler: EventHandler): Result<void> {
    try {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
          this.handlers.set(eventType, handlers);
        }
      }
      return Result.ok();
    } catch (_error) {
      return Result.fail("UNSUBSCRIPTION_FAILED");
    }
  }

  async dispatch(event: IDomainEvent): Promise<Result<void>> {
    try {
      const handlers = this.handlers.get(event.eventType) ?? [];

      for (const handler of handlers) {
        try {
          const result = handler(event);

          if (result instanceof Promise) {
            const awaitedResult = await result;
            if (awaitedResult.isFailure) {
              this.log(`Event handler failed: ${awaitedResult.getError()}`);
            }
          } else if (result.isFailure) {
            this.log(`Event handler failed: ${result.getError()}`);
          }
        } catch (error) {
          this.log("Event handler threw exception:", error);
        }
      }

      return Result.ok();
    } catch (error) {
      return Result.fail(`DISPATCH_FAILED: ${error}`);
    }
  }

  async dispatchAll(events: IDomainEvent[]): Promise<Result<void>> {
    try {
      for (const event of events) {
        await this.dispatch(event);
      }
      return Result.ok();
    } catch (error) {
      return Result.fail(`DISPATCH_FAILED: ${error}`);
    }
  }

  isSubscribed(eventType: string): boolean {
    const handlers = this.handlers.get(eventType);
    return handlers ? handlers.length > 0 : false;
  }

  getHandlerCount(eventType: string): number {
    const handlers = this.handlers.get(eventType);
    return handlers ? handlers.length : 0;
  }

  clearHandlers(): void {
    this.handlers.clear();
  }
}
