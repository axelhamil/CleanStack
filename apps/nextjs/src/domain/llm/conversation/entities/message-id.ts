import { UUID } from "@packages/ddd-kit";

export class MessageId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "MessageId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): MessageId {
    return new MessageId(id);
  }
}
