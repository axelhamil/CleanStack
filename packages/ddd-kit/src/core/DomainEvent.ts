/**
 * Interface for domain events with typed payload.
 * Domain events capture something that happened in the domain that is important to the business.
 *
 * @template T The type of the event payload
 */
export interface IDomainEvent<T = unknown> {
  readonly eventType: string;
  readonly dateOccurred: Date;
  readonly aggregateId: string;
  readonly payload: T;
}

/**
 * Abstract base class for domain events with typed payload.
 * Extend this class to create concrete domain events.
 *
 * @template T The type of the event payload
 *
 * @example
 * ```typescript
 * export class UserCreatedEvent extends BaseDomainEvent<{
 *   userId: string;
 *   email: string;
 *   name: string;
 * }> {
 *   readonly eventType = 'user.created';
 *
 *   constructor(
 *     readonly aggregateId: string,
 *     readonly payload: { userId: string; email: string; name: string }
 *   ) {
 *     super();
 *   }
 * }
 * ```
 */
export abstract class BaseDomainEvent<T = unknown> implements IDomainEvent<T> {
  readonly dateOccurred: Date;
  abstract readonly eventType: string;
  abstract readonly aggregateId: string;
  abstract readonly payload: T;

  constructor() {
    this.dateOccurred = new Date();
  }
}
