import { UUID } from "@packages/ddd-kit";

export class LLMUsageId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "LLMUsageId";

  static create(id: UUID<string | number>): LLMUsageId {
    return new LLMUsageId(id.value);
  }
}
