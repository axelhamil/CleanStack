import { UUID } from "@packages/ddd-kit";

export class ManagedPromptId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "ManagedPromptId";

  static create(id: UUID<string | number>): ManagedPromptId {
    return new ManagedPromptId(id.value);
  }
}
