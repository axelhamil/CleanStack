import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import {
  userToDomain,
  userToPersistence,
} from "@/adapters/mappers/user.mapper";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("UserMapper", () => {
  describe("userToDomain()", () => {
    const validRecord = {
      id: "user-123",
      email: "test@example.com",
      name: "John Doe",
      emailVerified: false,
      image: null,
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    };

    describe("happy path", () => {
      it("should map valid database record to User aggregate", () => {
        const result = userToDomain(validRecord);

        expect(result.isSuccess).toBe(true);
        const user = result.getValue();
        expect(user.id.value).toBe("user-123");
        expect(user.get("email").value).toBe("test@example.com");
        expect(user.get("name").value).toBe("John Doe");
      });

      it("should map email correctly", () => {
        const result = userToDomain(validRecord);

        const user = result.getValue();
        expect(user.get("email")).toBeInstanceOf(Email);
        expect(user.get("email").value).toBe("test@example.com");
      });

      it("should map name correctly", () => {
        const result = userToDomain(validRecord);

        const user = result.getValue();
        expect(user.get("name")).toBeInstanceOf(Name);
        expect(user.get("name").value).toBe("John Doe");
      });

      it("should map emailVerified status", () => {
        const verifiedRecord = { ...validRecord, emailVerified: true };

        const result = userToDomain(verifiedRecord);

        expect(result.getValue().get("emailVerified")).toBe(true);
      });

      it("should map unverified email status", () => {
        const unverifiedRecord = { ...validRecord, emailVerified: false };

        const result = userToDomain(unverifiedRecord);

        expect(result.getValue().get("emailVerified")).toBe(false);
      });

      it("should map null image to Option.none()", () => {
        const recordWithNullImage = { ...validRecord, image: null };

        const result = userToDomain(recordWithNullImage);

        expect(result.getValue().get("image").isNone()).toBe(true);
      });

      it("should map image to Option.some()", () => {
        const recordWithImage = {
          ...validRecord,
          image: "https://example.com/avatar.png",
        };

        const result = userToDomain(recordWithImage);

        expect(result.getValue().get("image").isSome()).toBe(true);
        expect(result.getValue().get("image").unwrap()).toBe(
          "https://example.com/avatar.png",
        );
      });

      it("should map createdAt timestamp", () => {
        const result = userToDomain(validRecord);

        expect(result.getValue().get("createdAt")).toEqual(
          new Date("2024-01-01T00:00:00Z"),
        );
      });

      it("should map updatedAt timestamp", () => {
        const result = userToDomain(validRecord);

        expect(result.getValue().get("updatedAt")).toEqual(
          new Date("2024-01-02T00:00:00Z"),
        );
      });

      it("should preserve user id from record", () => {
        const recordWithCustomId = { ...validRecord, id: "custom-user-id-456" };

        const result = userToDomain(recordWithCustomId);

        expect(result.getValue().id.value).toBe("custom-user-id-456");
      });
    });

    describe("validation errors", () => {
      it("should fail when email is invalid", () => {
        const invalidEmailRecord = { ...validRecord, email: "invalid-email" };

        const result = userToDomain(invalidEmailRecord);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("Invalid user data");
      });

      it("should fail when name is empty", () => {
        const emptyNameRecord = { ...validRecord, name: "" };

        const result = userToDomain(emptyNameRecord);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("Invalid user data");
      });

      it("should fail when name is too short", () => {
        const shortNameRecord = { ...validRecord, name: "A" };

        const result = userToDomain(shortNameRecord);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("Invalid user data");
      });
    });

    describe("reconstitution behavior", () => {
      it("should not emit domain events when reconstituting", () => {
        const result = userToDomain(validRecord);

        const user = result.getValue();
        expect(user.domainEvents).toHaveLength(0);
      });
    });
  });

  describe("userToPersistence()", () => {
    const createTestUser = (
      overrides: {
        email?: string;
        name?: string;
        emailVerified?: boolean;
        image?: string | null;
      } = {},
    ) => {
      const email = Email.create(
        overrides.email ?? ("test@example.com" as string),
      ).getValue();
      const name = Name.create(
        overrides.name ?? ("John Doe" as string),
      ).getValue();

      const user = User.create(
        {
          email,
          name,
          image: overrides.image ? Option.some(overrides.image) : Option.none(),
        },
        new UUID("user-test-123"),
      );

      if (overrides.emailVerified) {
        user.verify();
      }

      user.clearEvents();
      return user;
    };

    describe("happy path", () => {
      it("should map User aggregate to persistence format", () => {
        const user = createTestUser();

        const result = userToPersistence(user);

        expect(result).toEqual(
          expect.objectContaining({
            id: "user-test-123",
            email: "test@example.com",
            name: "John Doe",
          }),
        );
      });

      it("should map user id as string", () => {
        const user = createTestUser();

        const result = userToPersistence(user);

        expect(result.id).toBe("user-test-123");
        expect(typeof result.id).toBe("string");
      });

      it("should map email value", () => {
        const user = createTestUser({ email: "custom@example.com" });

        const result = userToPersistence(user);

        expect(result.email).toBe("custom@example.com");
      });

      it("should map name value", () => {
        const user = createTestUser({ name: "Jane Smith" });

        const result = userToPersistence(user);

        expect(result.name).toBe("Jane Smith");
      });

      it("should map emailVerified false by default", () => {
        const user = createTestUser();

        const result = userToPersistence(user);

        expect(result.emailVerified).toBe(false);
      });

      it("should map emailVerified true when verified", () => {
        const user = createTestUser({ emailVerified: true });

        const result = userToPersistence(user);

        expect(result.emailVerified).toBe(true);
      });

      it("should map Option.none() image to null", () => {
        const user = createTestUser({ image: null });

        const result = userToPersistence(user);

        expect(result.image).toBeNull();
      });

      it("should map Option.some() image to string", () => {
        const user = createTestUser({ image: "https://example.com/img.png" });

        const result = userToPersistence(user);

        expect(result.image).toBe("https://example.com/img.png");
      });

      it("should include createdAt timestamp", () => {
        const user = createTestUser();

        const result = userToPersistence(user);

        expect(result.createdAt).toBeInstanceOf(Date);
      });

      it("should include updatedAt timestamp", () => {
        const user = createTestUser();

        const result = userToPersistence(user);

        expect(result.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe("roundtrip", () => {
      it("should preserve data through toPersistence -> toDomain cycle", () => {
        const originalUser = createTestUser({
          email: "roundtrip@example.com",
          name: "Roundtrip User",
          image: "https://example.com/roundtrip.png",
        });

        const persistenceData = userToPersistence(originalUser);
        const reconstitutedResult = userToDomain({
          ...persistenceData,
          createdAt: persistenceData.createdAt ?? new Date(),
          updatedAt: persistenceData.updatedAt ?? new Date(),
        });

        expect(reconstitutedResult.isSuccess).toBe(true);
        const reconstitutedUser = reconstitutedResult.getValue();

        expect(reconstitutedUser.id.value).toBe(originalUser.id.value);
        expect(reconstitutedUser.get("email").value).toBe(
          originalUser.get("email").value,
        );
        expect(reconstitutedUser.get("name").value).toBe(
          originalUser.get("name").value,
        );
        expect(reconstitutedUser.get("image").unwrap()).toBe(
          originalUser.get("image").unwrap(),
        );
        expect(reconstitutedUser.get("emailVerified")).toBe(
          originalUser.get("emailVerified"),
        );
      });

      it("should preserve verified status through roundtrip", () => {
        const originalUser = createTestUser({ emailVerified: true });

        const persistenceData = userToPersistence(originalUser);
        const reconstitutedResult = userToDomain({
          ...persistenceData,
          createdAt: persistenceData.createdAt ?? new Date(),
          updatedAt: persistenceData.updatedAt ?? new Date(),
        });

        expect(reconstitutedResult.isSuccess).toBe(true);
        expect(reconstitutedResult.getValue().get("emailVerified")).toBe(true);
      });

      it("should preserve null image through roundtrip", () => {
        const originalUser = createTestUser({ image: null });

        const persistenceData = userToPersistence(originalUser);
        const reconstitutedResult = userToDomain({
          ...persistenceData,
          createdAt: persistenceData.createdAt ?? new Date(),
          updatedAt: persistenceData.updatedAt ?? new Date(),
        });

        expect(reconstitutedResult.isSuccess).toBe(true);
        expect(reconstitutedResult.getValue().get("image").isNone()).toBe(true);
      });
    });
  });
});
