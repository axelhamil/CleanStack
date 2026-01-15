import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { UserCreatedEvent } from "@/domain/user/events/user-created.event";
import { UserEmailVerifiedEvent } from "@/domain/user/events/user-verified.event";
import { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { Password } from "@/domain/user/value-objects/password.vo";

describe("Email Value Object", () => {
  describe("create()", () => {
    it("should create valid email", () => {
      const result = Email.create("test@example.com" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("test@example.com");
    });

    it("should accept uppercase email (validates as valid)", () => {
      const result = Email.create("TEST@EXAMPLE.COM" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("TEST@EXAMPLE.COM");
    });

    it("should reject email with whitespace (invalid format)", () => {
      const result = Email.create("  test@example.com  " as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for invalid email format", () => {
      const result = Email.create("invalid-email" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Invalid email format");
    });

    it("should fail for empty email", () => {
      const result = Email.create("" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for email too long", () => {
      const longEmail = `${"a".repeat(256)}@example.com`;
      const result = Email.create(longEmail as string);

      expect(result.isFailure).toBe(true);
    });

    it("should be equal by value", () => {
      const email1 = Email.create("test@example.com" as string).getValue();
      const email2 = Email.create("test@example.com" as string).getValue();

      expect(email1.equals(email2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const email1 = Email.create("test1@example.com" as string).getValue();
      const email2 = Email.create("test2@example.com" as string).getValue();

      expect(email1.equals(email2)).toBe(false);
    });
  });
});

describe("Name Value Object", () => {
  describe("create()", () => {
    it("should create valid name", () => {
      const result = Name.create("John Doe" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("John Doe");
    });

    it("should accept name with surrounding whitespace (preserved)", () => {
      const result = Name.create("  John Doe  " as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("  John Doe  ");
    });

    it("should fail for empty name", () => {
      const result = Name.create("" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Name is required");
    });

    it("should accept name with only spaces (meets min length)", () => {
      const result = Name.create("   " as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should fail for name too short", () => {
      const result = Name.create("J" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Name must be at least 2 characters");
    });

    it("should fail for name too long", () => {
      const result = Name.create("a".repeat(101) as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Name must be less than 100 characters");
    });

    it("should accept minimum valid length name", () => {
      const result = Name.create("Jo" as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should accept maximum valid length name", () => {
      const result = Name.create("a".repeat(100) as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should be equal by value", () => {
      const name1 = Name.create("John" as string).getValue();
      const name2 = Name.create("John" as string).getValue();

      expect(name1.equals(name2)).toBe(true);
    });
  });
});

describe("Password Value Object", () => {
  describe("create()", () => {
    it("should create valid password", () => {
      const result = Password.create("password123" as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("password123");
    });

    it("should fail for empty password", () => {
      const result = Password.create("" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Password is required");
    });

    it("should fail for password too short", () => {
      const result = Password.create("short" as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Password must be at least 8 characters");
    });

    it("should fail for password too long", () => {
      const result = Password.create("a".repeat(129) as string);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe(
        "Password must be less than 128 characters",
      );
    });

    it("should accept minimum valid length password", () => {
      const result = Password.create("12345678" as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should accept maximum valid length password", () => {
      const result = Password.create("a".repeat(128) as string);

      expect(result.isSuccess).toBe(true);
    });

    it("should be equal by value", () => {
      const password1 = Password.create("password123" as string).getValue();
      const password2 = Password.create("password123" as string).getValue();

      expect(password1.equals(password2)).toBe(true);
    });
  });
});

describe("UserId", () => {
  describe("create()", () => {
    it("should create UserId from UUID", () => {
      const uuid = new UUID<string>();
      const userId = UserId.create(uuid);

      expect(userId).toBeInstanceOf(UserId);
      expect(userId.value).toBe(uuid.value);
    });

    it("should preserve UUID value", () => {
      const uuid = new UUID<string>("test-uuid-value");
      const userId = UserId.create(uuid);

      expect(userId.value).toBe("test-uuid-value");
    });
  });
});

describe("User Aggregate", () => {
  const createValidEmail = () =>
    Email.create("test@example.com" as string).getValue();
  const createValidName = () => Name.create("John Doe" as string).getValue();

  describe("create()", () => {
    it("should create user with valid props", () => {
      const email = createValidEmail();
      const name = createValidName();

      const user = User.create({
        email,
        name,
        image: Option.none(),
      });

      expect(user.get("email").value).toBe("test@example.com");
      expect(user.get("name").value).toBe("John Doe");
      expect(user.get("emailVerified")).toBe(false);
    });

    it("should set createdAt and updatedAt on creation", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      expect(user.get("createdAt")).toBeInstanceOf(Date);
      expect(user.get("updatedAt")).toBeInstanceOf(Date);
    });

    it("should generate unique id if not provided", () => {
      const user1 = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      const user2 = User.create({
        email: Email.create("other@example.com" as string).getValue(),
        name: createValidName(),
        image: Option.none(),
      });

      expect(user1.id.value).not.toBe(user2.id.value);
    });

    it("should use provided id if given", () => {
      const customId = new UUID<string>("custom-id");

      const user = User.create(
        {
          email: createValidEmail(),
          name: createValidName(),
          image: Option.none(),
        },
        customId,
      );

      expect(user.id.value).toBe("custom-id");
    });

    it("should emit UserCreatedEvent on creation", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UserCreatedEvent);
    });

    it("should NOT emit UserCreatedEvent when id is provided (reconstitution)", () => {
      const existingId = new UUID<string>("existing-id");

      const user = User.create(
        {
          email: createValidEmail(),
          name: createValidName(),
          image: Option.none(),
        },
        existingId,
      );

      expect(user.domainEvents).toHaveLength(0);
    });

    it("should handle optional image", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.some("https://example.com/avatar.png"),
      });

      expect(user.get("image").isSome()).toBe(true);
      expect(user.get("image").unwrap()).toBe("https://example.com/avatar.png");
    });

    it("should handle none image", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      expect(user.get("image").isNone()).toBe(true);
    });
  });

  describe("reconstitute()", () => {
    it("should create user without emitting events", () => {
      const email = createValidEmail();
      const name = createValidName();
      const userId = UserId.create(new UUID<string>());

      const user = User.reconstitute(
        {
          email,
          name,
          emailVerified: true,
          image: Option.none(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        userId,
      );

      expect(user.domainEvents).toHaveLength(0);
      expect(user.get("emailVerified")).toBe(true);
    });

    it("should preserve all properties", () => {
      const email = createValidEmail();
      const name = createValidName();
      const userId = UserId.create(new UUID<string>("preserved-id"));
      const createdAt = new Date("2024-01-01");
      const updatedAt = new Date("2024-06-01");

      const user = User.reconstitute(
        {
          email,
          name,
          emailVerified: true,
          image: Option.some("avatar.png"),
          createdAt,
          updatedAt,
        },
        userId,
      );

      expect(user.id.value).toBe("preserved-id");
      expect(user.get("email").value).toBe("test@example.com");
      expect(user.get("name").value).toBe("John Doe");
      expect(user.get("emailVerified")).toBe(true);
      expect(user.get("image").unwrap()).toBe("avatar.png");
      expect(user.get("createdAt")).toBe(createdAt);
      expect(user.get("updatedAt")).toBe(updatedAt);
    });
  });

  describe("verify()", () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });
      user.clearEvents();
    });

    it("should mark user as verified", () => {
      const result = user.verify();

      expect(result.isSuccess).toBe(true);
      expect(user.get("emailVerified")).toBe(true);
    });

    it("should update updatedAt timestamp", () => {
      const beforeUpdate = user.get("updatedAt") as Date;
      user.verify();
      const afterUpdate = user.get("updatedAt") as Date;

      expect(afterUpdate.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it("should emit UserEmailVerifiedEvent", () => {
      user.verify();

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UserEmailVerifiedEvent);
    });

    it("should fail if already verified", () => {
      user.verify();
      user.clearEvents();

      const result = user.verify();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("User is already verified");
      expect(user.domainEvents).toHaveLength(0);
    });
  });

  describe("updateName()", () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });
    });

    it("should update name", () => {
      const newName = Name.create("Jane Smith" as string).getValue();

      user.updateName(newName);

      expect(user.get("name").value).toBe("Jane Smith");
    });

    it("should update updatedAt timestamp", () => {
      const beforeUpdate = user.get("updatedAt") as Date;
      const newName = Name.create("Jane Smith" as string).getValue();

      user.updateName(newName);

      expect((user.get("updatedAt") as Date).getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe("updateImage()", () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });
    });

    it("should update image to some value", () => {
      user.updateImage(Option.some("https://example.com/new-avatar.png"));

      expect(user.get("image").isSome()).toBe(true);
      expect(user.get("image").unwrap()).toBe(
        "https://example.com/new-avatar.png",
      );
    });

    it("should update image to none", () => {
      user.updateImage(Option.some("initial-avatar.png"));
      user.updateImage(Option.none());

      expect(user.get("image").isNone()).toBe(true);
    });

    it("should update updatedAt timestamp", () => {
      const beforeUpdate = user.get("updatedAt") as Date;

      user.updateImage(Option.some("new-avatar.png"));

      expect((user.get("updatedAt") as Date).getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });

  describe("id getter", () => {
    it("should return UserId instance", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      expect(user.id).toBeInstanceOf(UserId);
    });
  });
});
