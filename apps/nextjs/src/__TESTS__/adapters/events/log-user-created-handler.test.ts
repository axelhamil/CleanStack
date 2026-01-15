import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LogUserCreatedHandler } from "@/application/event-handlers/log-user-created.handler";
import { UserCreatedEvent } from "@/domain/user/events/user-created.event";

describe("LogUserCreatedHandler", () => {
  let handler: LogUserCreatedHandler;

  beforeEach(() => {
    handler = new LogUserCreatedHandler();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("eventType", () => {
    it("should have correct event type", () => {
      expect(handler.eventType).toBe("user.created");
    });
  });

  describe("handle()", () => {
    it("should log user creation", async () => {
      const event = new UserCreatedEvent(
        "user-123",
        "test@example.com",
        "John",
      );

      const result = await handler.handle(event);

      expect(result.isSuccess).toBe(true);
      expect(console.log).toHaveBeenCalledWith(
        "[Event] User created: user-123 - test@example.com",
      );
    });

    it("should return success result", async () => {
      const event = new UserCreatedEvent(
        "user-456",
        "another@test.com",
        "Jane",
      );

      const result = await handler.handle(event);

      expect(result.isSuccess).toBe(true);
    });
  });
});
