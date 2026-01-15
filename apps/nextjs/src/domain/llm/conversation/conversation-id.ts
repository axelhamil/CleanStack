import { UUID } from "@packages/ddd-kit";

export class ConversationId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "ConversationId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): ConversationId {
    return new ConversationId(id);
  }
}
