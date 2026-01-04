import { UUID } from "@packages/ddd-kit";

export class UserId extends UUID<string | number> {
  protected [Symbol.toStringTag] = "UserId";

  private constructor(id: UUID<string | number>) {
    super(id ? id.value : new UUID<string | number>().value);
  }

  static create(id: UUID<string | number>): UserId {
    return new UserId(id);
  }
}
