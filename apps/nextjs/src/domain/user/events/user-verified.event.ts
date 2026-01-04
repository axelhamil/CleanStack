import type { DomainEvent } from "@packages/ddd-kit";

export class UserVerifiedEvent implements DomainEvent {
  public readonly type = "UserVerified";
  public readonly dateTimeOccurred: Date;
  public readonly aggregateId: string;

  constructor(userId: string) {
    this.aggregateId = userId;
    this.dateTimeOccurred = new Date();
  }
}
