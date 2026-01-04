import type { DomainEvent } from "@packages/ddd-kit";

export class UserCreatedEvent implements DomainEvent {
  public readonly type = "UserCreated";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(
    userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    this.aggregateId = userId;
    this.dateTimeOccurred = new Date();
  }
}
