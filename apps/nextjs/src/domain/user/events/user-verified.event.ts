import { BaseDomainEvent } from "@packages/ddd-kit";

export class UserVerifiedEvent extends BaseDomainEvent<void> {
  readonly eventType = "user.verified";
  readonly aggregateId: string;
  readonly payload: void = undefined;

  constructor(userId: string) {
    super();
    this.aggregateId = userId;
  }
}
