import { BaseDomainEvent } from "@packages/ddd-kit";

interface UserSignedInPayload {
  userId: string;
  email: string;
  signedInAt: Date;
}

export class UserSignedInEvent extends BaseDomainEvent<UserSignedInPayload> {
  readonly eventType = "user.signed_in";
  readonly aggregateId: string;
  readonly payload: UserSignedInPayload;

  constructor(userId: string, email: string) {
    super();
    this.aggregateId = userId;
    this.payload = {
      userId,
      email,
      signedInAt: new Date(),
    };
  }
}
