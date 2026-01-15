import { UUID } from "@packages/ddd-kit";

export class SubscriptionId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "SubscriptionId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): SubscriptionId {
    return new SubscriptionId(id);
  }
}
