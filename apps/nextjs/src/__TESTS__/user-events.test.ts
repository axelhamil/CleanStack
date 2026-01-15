import { Option } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { UserCreatedEvent } from "@/domain/user/events/user-created.event";
import { UserSignedInEvent } from "@/domain/user/events/user-signed-in.event";
import { UserEmailVerifiedEvent } from "@/domain/user/events/user-verified.event";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("UserCreatedEvent", () => {
  describe("constructor", () => {
    it("should create event with correct payload", () => {
      const event = new UserCreatedEvent(
        "user-123",
        "test@example.com",
        "John Doe",
      );

      expect(event.eventType).toBe("user.created");
      expect(event.aggregateId).toBe("user-123");
      expect(event.payload).toEqual({
        userId: "user-123",
        email: "test@example.com",
        name: "John Doe",
      });
    });

    it("should set dateOccurred on creation", () => {
      const before = new Date();
      const event = new UserCreatedEvent("user-1", "a@test.com", "Test");
      const after = new Date();

      expect(event.dateOccurred.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(event.dateOccurred.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should have unique dateOccurred for different events", async () => {
      const event1 = new UserCreatedEvent("1", "a@test.com", "A");
      await new Promise((r) => setTimeout(r, 1));
      const event2 = new UserCreatedEvent("2", "b@test.com", "B");

      expect(event1.dateOccurred.getTime()).toBeLessThan(
        event2.dateOccurred.getTime(),
      );
    });
  });
});

describe("UserEmailVerifiedEvent", () => {
  describe("constructor", () => {
    it("should create event with correct payload", () => {
      const event = new UserEmailVerifiedEvent("user-456", "verified@test.com");

      expect(event.eventType).toBe("user.email_verified");
      expect(event.aggregateId).toBe("user-456");
      expect(event.payload.userId).toBe("user-456");
      expect(event.payload.email).toBe("verified@test.com");
      expect(event.payload.verifiedAt).toBeInstanceOf(Date);
    });

    it("should set verifiedAt to current date", () => {
      const before = new Date();
      const event = new UserEmailVerifiedEvent("user-1", "a@test.com");
      const after = new Date();

      expect(event.payload.verifiedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(event.payload.verifiedAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it("should set dateOccurred on creation", () => {
      const before = new Date();
      const event = new UserEmailVerifiedEvent("user-1", "a@test.com");
      const after = new Date();

      expect(event.dateOccurred.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(event.dateOccurred.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});

describe("UserSignedInEvent", () => {
  describe("constructor", () => {
    it("should create event with correct payload", () => {
      const event = new UserSignedInEvent("user-789", "signin@test.com");

      expect(event.eventType).toBe("user.signed_in");
      expect(event.aggregateId).toBe("user-789");
      expect(event.payload.userId).toBe("user-789");
      expect(event.payload.email).toBe("signin@test.com");
      expect(event.payload.signedInAt).toBeInstanceOf(Date);
    });

    it("should set signedInAt to current date", () => {
      const before = new Date();
      const event = new UserSignedInEvent("user-1", "a@test.com");
      const after = new Date();

      expect(event.payload.signedInAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(event.payload.signedInAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it("should set dateOccurred on creation", () => {
      const before = new Date();
      const event = new UserSignedInEvent("user-1", "a@test.com");
      const after = new Date();

      expect(event.dateOccurred.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(event.dateOccurred.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});

describe("User Aggregate Event Emission", () => {
  const createValidEmail = () =>
    Email.create("test@example.com" as string).getValue();
  const createValidName = () => Name.create("John Doe" as string).getValue();

  describe("User.create()", () => {
    it("should emit UserCreatedEvent when creating new user", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      const events = user.domainEvents;

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
    });

    it("should emit event with correct user data", () => {
      const email = Email.create("new@example.com" as string).getValue();
      const name = Name.create("Jane Smith" as string).getValue();

      const user = User.create({
        email,
        name,
        image: Option.none(),
      });

      const event = user.domainEvents[0] as UserCreatedEvent;

      expect(event.aggregateId).toBe(user.id.value);
      expect(event.payload.email).toBe("new@example.com");
      expect(event.payload.name).toBe("Jane Smith");
      expect(event.payload.userId).toBe(user.id.value);
    });

    it("should NOT emit event when reconstituting user", () => {
      const email = createValidEmail();
      const name = createValidName();

      const user = User.create({
        email,
        name,
        image: Option.none(),
      });

      user.clearEvents();

      const reconstituted = User.reconstitute(
        {
          email,
          name,
          emailVerified: false,
          image: Option.none(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        user.id,
      );

      expect(reconstituted.domainEvents).toHaveLength(0);
    });
  });

  describe("User.verify()", () => {
    let user: User;

    beforeEach(() => {
      user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });
      user.clearEvents();
    });

    it("should emit UserEmailVerifiedEvent on verification", () => {
      user.verify();

      const events = user.domainEvents;

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserEmailVerifiedEvent);
    });

    it("should emit event with correct verification data", () => {
      user.verify();

      const event = user.domainEvents[0] as UserEmailVerifiedEvent;

      expect(event.aggregateId).toBe(user.id.value);
      expect(event.payload.userId).toBe(user.id.value);
      expect(event.payload.email).toBe("test@example.com");
      expect(event.payload.verifiedAt).toBeInstanceOf(Date);
    });

    it("should NOT emit event if already verified", () => {
      user.verify();
      user.clearEvents();

      const result = user.verify();

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("User is already verified");
      expect(user.domainEvents).toHaveLength(0);
    });
  });

  describe("Event clearing", () => {
    it("should clear all events when clearEvents is called", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      expect(user.domainEvents).toHaveLength(1);

      user.clearEvents();

      expect(user.domainEvents).toHaveLength(0);
    });

    it("should accumulate multiple events before clearing", () => {
      const user = User.create({
        email: createValidEmail(),
        name: createValidName(),
        image: Option.none(),
      });

      user.verify();

      expect(user.domainEvents).toHaveLength(2);
      expect(user.domainEvents[0]).toBeInstanceOf(UserCreatedEvent);
      expect(user.domainEvents[1]).toBeInstanceOf(UserEmailVerifiedEvent);
    });
  });
});
