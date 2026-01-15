import { beforeEach, describe, expect, it, vi } from "vitest";
import { type DomainEvent, DomainEvents, Result } from "../index";

const createTestEvent = (
  aggregateId: string,
  data: string,
): DomainEvent & { data: string } => ({
  type: "TestEvent",
  dateTimeOccurred: new Date(),
  aggregateId,
  data,
});

const createAnotherEvent = (
  aggregateId: string,
  value: number,
): DomainEvent & { value: number } => ({
  type: "AnotherEvent",
  dateTimeOccurred: new Date(),
  aggregateId,
  value,
});

describe("DomainEvents", () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();
    DomainEvents.clearEvents();
    DomainEvents.setLogging(false);
  });

  describe("subscribe()", () => {
    it("should register handler for event type", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = DomainEvents.subscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
      expect(DomainEvents.isSubscribed("TestEvent")).toBe(true);
    });

    it("should support multiple handlers for same event type", () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());

      DomainEvents.subscribe("TestEvent", handler1);
      DomainEvents.subscribe("TestEvent", handler2);

      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(2);
    });

    it("should return success result", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = DomainEvents.subscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("unsubscribe()", () => {
    it("should remove handler from event type", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      DomainEvents.unsubscribe("TestEvent", handler);

      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(0);
    });

    it("should not fail when handler is not subscribed", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = DomainEvents.unsubscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
    });

    it("should not fail when event type has no handlers", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = DomainEvents.unsubscribe("NonExistentEvent", handler);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("isSubscribed()", () => {
    it("should return true when handlers exist", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      expect(DomainEvents.isSubscribed("TestEvent")).toBe(true);
    });

    it("should return false when no handlers exist", () => {
      expect(DomainEvents.isSubscribed("TestEvent")).toBe(false);
    });

    it("should return false after all handlers unsubscribed", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.unsubscribe("TestEvent", handler);

      expect(DomainEvents.isSubscribed("TestEvent")).toBe(false);
    });
  });

  describe("registerEvent()", () => {
    it("should register event for entity", () => {
      const event = createTestEvent("entity-1", "test data");

      const result = DomainEvents.registerEvent("entity-1", event);

      expect(result.isSuccess).toBe(true);
      expect(DomainEvents.hasEvents("entity-1")).toBe(true);
    });

    it("should accumulate multiple events for same entity", () => {
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-1", "data 2");

      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-1", event2);

      expect(DomainEvents.getTotalEventCount()).toBe(2);
    });

    it("should register events for different entities", () => {
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-2", "data 2");

      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-2", event2);

      expect(DomainEvents.hasEvents("entity-1")).toBe(true);
      expect(DomainEvents.hasEvents("entity-2")).toBe(true);
    });
  });

  describe("dispatch()", () => {
    it("should call handler with event", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      const event = createTestEvent("entity-1", "test data");
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(handler).toHaveBeenCalledWith(event);
    });

    it("should call all handlers for event type", async () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler1);
      DomainEvents.subscribe("TestEvent", handler2);

      const event = createTestEvent("entity-1", "test data");
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(handler1).toHaveBeenCalledWith(event);
      expect(handler2).toHaveBeenCalledWith(event);
    });

    it("should dispatch multiple events for entity", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 1"),
      );
      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 2"),
      );

      await DomainEvents.dispatch("entity-1");

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should clear events after dispatch", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      await DomainEvents.dispatch("entity-1");

      expect(DomainEvents.hasEvents("entity-1")).toBe(false);
    });

    it("should not fail if no events registered", async () => {
      const result = await DomainEvents.dispatch("non-existent-entity");

      expect(result.isSuccess).toBe(true);
    });

    it("should not fail if no handlers registered", async () => {
      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );

      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
    });

    it("should dispatch to correct handlers based on event type", async () => {
      const testHandler = vi.fn().mockReturnValue(Result.ok());
      const anotherHandler = vi.fn().mockReturnValue(Result.ok());

      DomainEvents.subscribe("TestEvent", testHandler);
      DomainEvents.subscribe("AnotherEvent", anotherHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      await DomainEvents.dispatch("entity-1");

      expect(testHandler).toHaveBeenCalled();
      expect(anotherHandler).not.toHaveBeenCalled();
    });

    it("should handle async handlers", async () => {
      const asyncHandler = vi.fn().mockResolvedValue(Result.ok());
      DomainEvents.subscribe("TestEvent", asyncHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      await DomainEvents.dispatch("entity-1");

      expect(asyncHandler).toHaveBeenCalled();
    });

    it("should continue if sync handler fails", async () => {
      const failingHandler = vi.fn().mockReturnValue(Result.fail("error"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());

      DomainEvents.subscribe("TestEvent", failingHandler);
      DomainEvents.subscribe("TestEvent", successHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });

    it("should continue if async handler rejects", async () => {
      const failingHandler = vi
        .fn()
        .mockRejectedValue(new Error("async error"));
      const successHandler = vi.fn().mockResolvedValue(Result.ok());

      DomainEvents.subscribe("TestEvent", failingHandler);
      DomainEvents.subscribe("TestEvent", successHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });

    it("should continue if async handler returns failure", async () => {
      const failingHandler = vi
        .fn()
        .mockResolvedValue(Result.fail("async failure"));
      const successHandler = vi.fn().mockResolvedValue(Result.ok());

      DomainEvents.subscribe("TestEvent", failingHandler);
      DomainEvents.subscribe("TestEvent", successHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe("dispatchAll()", () => {
    it("should dispatch events for all entities", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 1"),
      );
      DomainEvents.registerEvent(
        "entity-2",
        createTestEvent("entity-2", "data 2"),
      );

      await DomainEvents.dispatchAll();

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should clear all events after dispatch", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 1"),
      );
      DomainEvents.registerEvent(
        "entity-2",
        createTestEvent("entity-2", "data 2"),
      );

      await DomainEvents.dispatchAll();

      expect(DomainEvents.getTotalEventCount()).toBe(0);
    });

    it("should not fail if no events registered", async () => {
      const result = await DomainEvents.dispatchAll();

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("getEventsForEntity()", () => {
    it("should return Some with events when events exist", () => {
      const event = createTestEvent("entity-1", "data");
      DomainEvents.registerEvent("entity-1", event);

      const result = DomainEvents.getEventsForEntity("entity-1");

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toHaveLength(1);
    });

    it("should return None when no events exist", () => {
      const result = DomainEvents.getEventsForEntity("non-existent-entity");

      expect(result.isNone()).toBe(true);
    });
  });

  describe("clearEvents()", () => {
    it("should remove all registered events", () => {
      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 1"),
      );
      DomainEvents.registerEvent(
        "entity-2",
        createTestEvent("entity-2", "data 2"),
      );

      DomainEvents.clearEvents();

      expect(DomainEvents.getTotalEventCount()).toBe(0);
    });
  });

  describe("clearHandlers()", () => {
    it("should remove all registered handlers", () => {
      DomainEvents.subscribe("TestEvent", vi.fn().mockReturnValue(Result.ok()));
      DomainEvents.subscribe(
        "AnotherEvent",
        vi.fn().mockReturnValue(Result.ok()),
      );

      DomainEvents.clearHandlers();

      expect(DomainEvents.isSubscribed("TestEvent")).toBe(false);
      expect(DomainEvents.isSubscribed("AnotherEvent")).toBe(false);
    });
  });

  describe("getHandlerCount()", () => {
    it("should return correct count of handlers", () => {
      DomainEvents.subscribe("TestEvent", vi.fn().mockReturnValue(Result.ok()));
      DomainEvents.subscribe("TestEvent", vi.fn().mockReturnValue(Result.ok()));

      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(2);
    });

    it("should return 0 when no handlers", () => {
      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(0);
    });
  });

  describe("hasEvents()", () => {
    it("should return true when entity has events", () => {
      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );

      expect(DomainEvents.hasEvents("entity-1")).toBe(true);
    });

    it("should return false when entity has no events", () => {
      expect(DomainEvents.hasEvents("entity-1")).toBe(false);
    });
  });

  describe("getTotalEventCount()", () => {
    it("should return total count of all events", () => {
      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 1"),
      );
      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data 2"),
      );
      DomainEvents.registerEvent(
        "entity-2",
        createTestEvent("entity-2", "data 3"),
      );

      expect(DomainEvents.getTotalEventCount()).toBe(3);
    });

    it("should return 0 when no events", () => {
      expect(DomainEvents.getTotalEventCount()).toBe(0);
    });
  });

  describe("setLogging()", () => {
    it("should enable logging", () => {
      DomainEvents.setLogging(true);
      // No assertion - just verify no error
    });

    it("should disable logging", () => {
      DomainEvents.setLogging(false);
      // No assertion - just verify no error
    });
  });

  describe("constructor", () => {
    it("should be instantiable", () => {
      const instance = new DomainEvents();

      expect(instance).toBeInstanceOf(DomainEvents);
    });
  });

  describe("edge cases", () => {
    it("should handle mixed sync and async handlers", async () => {
      const syncHandler = vi.fn().mockReturnValue(Result.ok());
      const asyncHandler = vi.fn().mockResolvedValue(Result.ok());

      DomainEvents.subscribe("TestEvent", syncHandler);
      DomainEvents.subscribe("TestEvent", asyncHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      await DomainEvents.dispatch("entity-1");

      expect(syncHandler).toHaveBeenCalled();
      expect(asyncHandler).toHaveBeenCalled();
    });

    it("should handle multiple event types for same entity", async () => {
      const testHandler = vi.fn().mockReturnValue(Result.ok());
      const anotherHandler = vi.fn().mockReturnValue(Result.ok());

      DomainEvents.subscribe("TestEvent", testHandler);
      DomainEvents.subscribe("AnotherEvent", anotherHandler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      DomainEvents.registerEvent(
        "entity-1",
        createAnotherEvent("entity-1", 42),
      );

      await DomainEvents.dispatch("entity-1");

      expect(testHandler).toHaveBeenCalledTimes(1);
      expect(anotherHandler).toHaveBeenCalledTimes(1);
    });

    it("should not call dispatched events again", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler);

      DomainEvents.registerEvent(
        "entity-1",
        createTestEvent("entity-1", "data"),
      );
      await DomainEvents.dispatch("entity-1");
      await DomainEvents.dispatch("entity-1");

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
