import { BaseDomainEvent } from "@packages/ddd-kit";

interface UserCreatedPayload {
  userId: string;
  email: string;
  name: string;
}

export class UserCreatedEvent extends BaseDomainEvent<UserCreatedPayload> {
  readonly eventType = "user.created";
  readonly aggregateId: string;
  readonly payload: UserCreatedPayload;

  constructor(userId: string, email: string, name: string) {
    super();
    this.aggregateId = userId;
    this.payload = { userId, email, name };
  }
}
