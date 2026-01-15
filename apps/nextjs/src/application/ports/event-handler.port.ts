import type { IDomainEvent, Result } from "@packages/ddd-kit";

export interface IEventHandler<T extends IDomainEvent = IDomainEvent> {
  readonly eventType: string;
  handle(event: T): Promise<Result<void>>;
}
