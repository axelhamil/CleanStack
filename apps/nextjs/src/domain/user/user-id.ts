import { UUID } from "@packages/ddd-kit";

export class UserId extends UUID<string> {
  static create(id: UUID<string>): UserId {
    return new UserId(id.value);
  }

  static fromString(id: string): UserId {
    return new UserId(id);
  }
}
