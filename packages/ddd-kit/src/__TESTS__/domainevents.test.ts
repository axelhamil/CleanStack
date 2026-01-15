import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDomainEvent } from "../core/DomainEvent";
import { DomainEvents, Result } from "../index";

interface TestPayload {
  data: string;
}

interface AnotherPayload {
  value: number;
}

const createTestEvent = (
  aggregateId: string,
  data: string,
): IDomainEvent<TestPayload> => ({
  eventType: "TestEvent",
  dateOccurred: new Date(),
  aggregateId,
  payload: { data },
});

const createAnotherEvent = (
  aggregateId: string,
  value: number,
): IDomainEvent<AnotherPayload> => ({
  eventType: "AnotherEvent",
  dateOccurred: new Date(),
  aggregateId,
  payload: { value },
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

      const result = DomainEvents.unsubscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(0);
    });

    it("should not fail when handler is not subscribed", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = DomainEvents.unsubscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
    });

    it("should not fail when event type has no handlers", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = DomainEvents.unsubscribe("NonExistent", handler);

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

      const events = DomainEvents.getEventsForEntity("entity-1");
      expect(events.isSome()).toBe(true);
      expect(events.unwrap()).toHaveLength(2);
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
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(handler).toHaveBeenCalledWith(event);
    });

    it("should call all handlers for event type", async () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", handler1);
      DomainEvents.subscribe("TestEvent", handler2);
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it("should dispatch multiple events for entity", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-1", "data 2");

      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-1", event2);

      await DomainEvents.dispatch("entity-1");

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should clear events after dispatch", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(DomainEvents.hasEvents("entity-1")).toBe(false);
    });

    it("should not fail if no events registered", async () => {
      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
    });

    it("should not fail if no handlers registered", async () => {
      const event = createTestEvent("entity-1", "test data");
      DomainEvents.registerEvent("entity-1", event);

      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
    });

    it("should dispatch to correct handlers based on event type", async () => {
      const testHandler = vi.fn().mockReturnValue(Result.ok());
      const anotherHandler = vi.fn().mockReturnValue(Result.ok());
      const testEvent = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", testHandler);
      DomainEvents.subscribe("AnotherEvent", anotherHandler);
      DomainEvents.registerEvent("entity-1", testEvent);

      await DomainEvents.dispatch("entity-1");

      expect(testHandler).toHaveBeenCalled();
      expect(anotherHandler).not.toHaveBeenCalled();
    });

    it("should handle async handlers", async () => {
      const asyncHandler = vi.fn().mockResolvedValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", asyncHandler);
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(asyncHandler).toHaveBeenCalled();
    });

    it("should continue if sync handler fails", async () => {
      const failingHandler = vi.fn().mockReturnValue(Result.fail("error"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", failingHandler);
      DomainEvents.subscribe("TestEvent", successHandler);
      DomainEvents.registerEvent("entity-1", event);

      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });

    it("should continue if async handler rejects", async () => {
      const failingHandler = vi
        .fn()
        .mockRejectedValue(new Error("async error"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", failingHandler);
      DomainEvents.subscribe("TestEvent", successHandler);
      DomainEvents.registerEvent("entity-1", event);

      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });

    it("should continue if async handler returns failure", async () => {
      const failingHandler = vi
        .fn()
        .mockResolvedValue(Result.fail("async failure"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", failingHandler);
      DomainEvents.subscribe("TestEvent", successHandler);
      DomainEvents.registerEvent("entity-1", event);

      const result = await DomainEvents.dispatch("entity-1");

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe("dispatchAll()", () => {
    it("should dispatch events for all entities", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-2", "data 2");

      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-2", event2);

      await DomainEvents.dispatchAll();

      expect(handler).toHaveBeenCalledTimes(2);
    });

    it("should clear all events after dispatch", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-2", "data 2");

      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-2", event2);

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
      const event = createTestEvent("entity-1", "test data");
      DomainEvents.registerEvent("entity-1", event);

      const result = DomainEvents.getEventsForEntity("entity-1");

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toContain(event);
    });

    it("should return None when no events exist", () => {
      const result = DomainEvents.getEventsForEntity("entity-1");

      expect(result.isNone()).toBe(true);
    });
  });

  describe("clearEvents()", () => {
    it("should remove all registered events", () => {
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-2", "data 2");
      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-2", event2);

      DomainEvents.clearEvents();

      expect(DomainEvents.getTotalEventCount()).toBe(0);
    });
  });

  describe("clearHandlers()", () => {
    it("should remove all registered handlers", () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler1);
      DomainEvents.subscribe("AnotherEvent", handler2);

      DomainEvents.clearHandlers();

      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(0);
      expect(DomainEvents.getHandlerCount("AnotherEvent")).toBe(0);
    });
  });

  describe("getHandlerCount()", () => {
    it("should return correct count of handlers", () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      DomainEvents.subscribe("TestEvent", handler1);
      DomainEvents.subscribe("TestEvent", handler2);

      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(2);
    });

    it("should return 0 when no handlers", () => {
      expect(DomainEvents.getHandlerCount("TestEvent")).toBe(0);
    });
  });

  describe("hasEvents()", () => {
    it("should return true when entity has events", () => {
      const event = createTestEvent("entity-1", "test data");
      DomainEvents.registerEvent("entity-1", event);

      expect(DomainEvents.hasEvents("entity-1")).toBe(true);
    });

    it("should return false when entity has no events", () => {
      expect(DomainEvents.hasEvents("entity-1")).toBe(false);
    });
  });

  describe("getTotalEventCount()", () => {
    it("should return total count of all events", () => {
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-1", "data 2");
      const event3 = createTestEvent("entity-2", "data 3");
      DomainEvents.registerEvent("entity-1", event1);
      DomainEvents.registerEvent("entity-1", event2);
      DomainEvents.registerEvent("entity-2", event3);

      expect(DomainEvents.getTotalEventCount()).toBe(3);
    });

    it("should return 0 when no events", () => {
      expect(DomainEvents.getTotalEventCount()).toBe(0);
    });
  });

  describe("setLogging()", () => {
    it("should enable logging", () => {
      DomainEvents.setLogging(true);
      // No direct way to test, but should not throw
      expect(true).toBe(true);
    });

    it("should disable logging", () => {
      DomainEvents.setLogging(false);
      // No direct way to test, but should not throw
      expect(true).toBe(true);
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
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", syncHandler);
      DomainEvents.subscribe("TestEvent", asyncHandler);
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");

      expect(syncHandler).toHaveBeenCalled();
      expect(asyncHandler).toHaveBeenCalled();
    });

    it("should handle multiple event types for same entity", async () => {
      const testHandler = vi.fn().mockReturnValue(Result.ok());
      const anotherHandler = vi.fn().mockReturnValue(Result.ok());
      const testEvent = createTestEvent("entity-1", "test data");
      const anotherEvent = createAnotherEvent("entity-1", 42);

      DomainEvents.subscribe("TestEvent", testHandler);
      DomainEvents.subscribe("AnotherEvent", anotherHandler);
      DomainEvents.registerEvent("entity-1", testEvent);
      DomainEvents.registerEvent("entity-1", anotherEvent);

      await DomainEvents.dispatch("entity-1");

      expect(testHandler).toHaveBeenCalledTimes(1);
      expect(anotherHandler).toHaveBeenCalledTimes(1);
    });

    it("should not call dispatched events again", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      DomainEvents.subscribe("TestEvent", handler);
      DomainEvents.registerEvent("entity-1", event);

      await DomainEvents.dispatch("entity-1");
      await DomainEvents.dispatch("entity-1");

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
