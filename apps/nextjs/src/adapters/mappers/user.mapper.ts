import { Option, UUID } from "@packages/ddd-kit";
import type { user as userTable } from "@packages/drizzle/schema";
import { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

type UserRecord = typeof userTable.$inferSelect;

export class UserMapper {
  static toDomain(record: UserRecord): User {
    const emailResult = Email.create(record.email);
    if (emailResult.isFailure) {
      throw new Error(`Invalid email in database: ${emailResult.getError()}`);
    }

    const nameResult = Name.create(record.name);
    if (nameResult.isFailure) {
      throw new Error(`Invalid name in database: ${nameResult.getError()}`);
    }

    return User.reconstitute(
      {
        email: emailResult.getValue(),
        name: nameResult.getValue(),
        emailVerified: record.emailVerified,
        image: Option.fromNullable(record.image),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      UserId.create(new UUID(record.id)),
    );
  }

  static toPersistence(user: User): Omit<
    UserRecord,
    "createdAt" | "updatedAt"
  > & {
    createdAt?: Date;
    updatedAt?: Date;
  } {
    return {
      id: String(user.id.value),
      email: user.get("email").value,
      name: user.get("name").value,
      emailVerified: user.get("emailVerified"),
      image: user.get("image").toNull(),
      createdAt: user.get("createdAt"),
      updatedAt: user.get("updatedAt"),
    };
  }
}
