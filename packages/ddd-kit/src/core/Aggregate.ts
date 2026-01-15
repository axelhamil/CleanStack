import type { IDomainEvent } from "./DomainEvent";
import { DomainEvents } from "./DomainEvents";
import { Entity } from "./Entity";
import { Result } from "./Result";
import type { UUID } from "./UUID";

/**
 * Interface for Aggregate Roots in Domain-Driven Design.
 * Aggregates are entities that manage domain events and ensure consistency boundaries.
 */
export interface IAggregate {
  /**
   * List of domain events associated with this aggregate.
   */
  readonly domainEvents: IDomainEvent[];
  /**
   * Clears all domain events from the aggregate.
   */
  clearEvents(): void;
  /**
   * Marks all domain events for dispatching.
   */
  markEventsForDispatch(): void;
}

/**
 * Abstract base class for Aggregate Roots.
 * Aggregates encapsulate domain logic and manage domain events.
 * @template T The type of properties for the aggregate.
 */
export abstract class Aggregate<T> extends Entity<T> implements IAggregate {
  private _domainEvents: IDomainEvent[] = [];

  /**
   * Creates a new Aggregate instance.
   * @param props The properties of the aggregate.
   * @param id Optional unique identifier for the aggregate.
   */
  protected constructor(props: T, id?: UUID<string | number>) {
    super(props, id);
  }

  /**
   * Returns a copy of the domain events associated with this aggregate.
   */
  public get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Removes all domain events from the aggregate.
   */
  public clearEvents(): void {
    this._domainEvents = [];
  }

  /**
   * Adds a domain event to the aggregate and registers it for dispatch.
   * @param event The domain event to add.
   * @returns Result indicating success or failure of registration.
   */
  protected addEvent(event: IDomainEvent): Result<void> {
    this._domainEvents.push(event);
    return DomainEvents.registerEvent(this._id.value.toString(), event);
  }

  /**
   * Adds a domain event to the aggregate (alias for addEvent).
   * @param event The domain event to add.
   */
  protected addDomainEvent(event: IDomainEvent): void {
    this.addEvent(event);
  }

  /**
   * Registers all domain events for dispatching.
   * @returns Result indicating success or failure of registration.
   */
  public markEventsForDispatch(): Result<void> {
    for (const event of this._domainEvents) {
      const result = DomainEvents.registerEvent(
        this._id.value.toString(),
        event,
      );
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }

  /**
   * Checks if the aggregate has any domain events.
   * @returns True if there are domain events, false otherwise.
   */
  public hasEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * Returns the number of domain events in the aggregate.
   */
  public getEventCount(): number {
    return this._domainEvents.length;
  }

  /**
   * Adds multiple domain events to the aggregate.
   * @param events Array of domain events to add.
   */
  protected addEvents(events: IDomainEvent[]): void {
    for (const event of events) {
      this.addEvent(event);
    }
  }
}
