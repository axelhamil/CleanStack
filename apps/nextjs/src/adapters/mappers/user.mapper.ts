import { Option, Result, UUID } from "@packages/ddd-kit";
import type { user as userTable } from "@packages/drizzle/schema";
import { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

type UserRecord = typeof userTable.$inferSelect;

type UserPersistence = Omit<UserRecord, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date;
};

export function userToDomain(record: UserRecord): Result<User> {
  const emailResult = Email.create(record.email);
  const nameResult = Name.create(record.name);

  const combined = Result.combine([emailResult, nameResult]);
  if (combined.isFailure) {
    return Result.fail(`Invalid user data: ${combined.getError()}`);
  }

  return Result.ok(
    User.reconstitute(
      {
        email: emailResult.getValue(),
        name: nameResult.getValue(),
        emailVerified: record.emailVerified,
        image: Option.fromNullable(record.image),
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      },
      UserId.create(new UUID(record.id)),
    ),
  );
}

export function userToPersistence(user: User): UserPersistence {
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
