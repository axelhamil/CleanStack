import type { IDomainEvent } from "@packages/ddd-kit";
import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryEventDispatcher } from "@/adapters/events/in-memory-event-dispatcher";

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

describe("InMemoryEventDispatcher", () => {
  let dispatcher: InMemoryEventDispatcher;

  beforeEach(() => {
    dispatcher = new InMemoryEventDispatcher();
  });

  describe("subscribe()", () => {
    it("should register handler for event type", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = dispatcher.subscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
      expect(dispatcher.isSubscribed("TestEvent")).toBe(true);
    });

    it("should support multiple handlers for same event type", () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());

      dispatcher.subscribe("TestEvent", handler1);
      dispatcher.subscribe("TestEvent", handler2);

      expect(dispatcher.getHandlerCount("TestEvent")).toBe(2);
    });

    it("should return success result", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = dispatcher.subscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("unsubscribe()", () => {
    it("should remove handler from event type", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      dispatcher.subscribe("TestEvent", handler);

      const result = dispatcher.unsubscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
      expect(dispatcher.getHandlerCount("TestEvent")).toBe(0);
    });

    it("should not fail when handler is not subscribed", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = dispatcher.unsubscribe("TestEvent", handler);

      expect(result.isSuccess).toBe(true);
    });

    it("should not fail when event type has no handlers", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());

      const result = dispatcher.unsubscribe("NonExistent", handler);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("isSubscribed()", () => {
    it("should return true when handlers exist", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      dispatcher.subscribe("TestEvent", handler);

      expect(dispatcher.isSubscribed("TestEvent")).toBe(true);
    });

    it("should return false when no handlers exist", () => {
      expect(dispatcher.isSubscribed("TestEvent")).toBe(false);
    });

    it("should return false after all handlers unsubscribed", () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      dispatcher.subscribe("TestEvent", handler);
      dispatcher.unsubscribe("TestEvent", handler);

      expect(dispatcher.isSubscribed("TestEvent")).toBe(false);
    });
  });

  describe("dispatch()", () => {
    it("should call handler with event", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", handler);

      await dispatcher.dispatch(event);

      expect(handler).toHaveBeenCalledWith(event);
    });

    it("should call all handlers for event type", async () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", handler1);
      dispatcher.subscribe("TestEvent", handler2);

      await dispatcher.dispatch(event);

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it("should dispatch to correct handlers based on event type", async () => {
      const testHandler = vi.fn().mockReturnValue(Result.ok());
      const anotherHandler = vi.fn().mockReturnValue(Result.ok());
      const testEvent = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", testHandler);
      dispatcher.subscribe("AnotherEvent", anotherHandler);

      await dispatcher.dispatch(testEvent);

      expect(testHandler).toHaveBeenCalled();
      expect(anotherHandler).not.toHaveBeenCalled();
    });

    it("should not fail if no handlers registered", async () => {
      const event = createTestEvent("entity-1", "test data");

      const result = await dispatcher.dispatch(event);

      expect(result.isSuccess).toBe(true);
    });

    it("should handle async handlers", async () => {
      const asyncHandler = vi.fn().mockResolvedValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", asyncHandler);

      await dispatcher.dispatch(event);

      expect(asyncHandler).toHaveBeenCalled();
    });

    it("should continue if sync handler fails", async () => {
      const failingHandler = vi.fn().mockReturnValue(Result.fail("error"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", failingHandler);
      dispatcher.subscribe("TestEvent", successHandler);

      const result = await dispatcher.dispatch(event);

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });

    it("should continue if async handler rejects", async () => {
      const failingHandler = vi
        .fn()
        .mockRejectedValue(new Error("async error"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", failingHandler);
      dispatcher.subscribe("TestEvent", successHandler);

      const result = await dispatcher.dispatch(event);

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });

    it("should continue if async handler returns failure", async () => {
      const failingHandler = vi
        .fn()
        .mockResolvedValue(Result.fail("async failure"));
      const successHandler = vi.fn().mockReturnValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", failingHandler);
      dispatcher.subscribe("TestEvent", successHandler);

      const result = await dispatcher.dispatch(event);

      expect(result.isSuccess).toBe(true);
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe("dispatchAll()", () => {
    it("should dispatch all events in order", async () => {
      const handler = vi.fn().mockReturnValue(Result.ok());
      const event1 = createTestEvent("entity-1", "data 1");
      const event2 = createTestEvent("entity-2", "data 2");

      dispatcher.subscribe("TestEvent", handler);

      await dispatcher.dispatchAll([event1, event2]);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, event1);
      expect(handler).toHaveBeenNthCalledWith(2, event2);
    });

    it("should dispatch different event types", async () => {
      const testHandler = vi.fn().mockReturnValue(Result.ok());
      const anotherHandler = vi.fn().mockReturnValue(Result.ok());
      const testEvent = createTestEvent("entity-1", "test data");
      const anotherEvent = createAnotherEvent("entity-1", 42);

      dispatcher.subscribe("TestEvent", testHandler);
      dispatcher.subscribe("AnotherEvent", anotherHandler);

      await dispatcher.dispatchAll([testEvent, anotherEvent]);

      expect(testHandler).toHaveBeenCalledTimes(1);
      expect(anotherHandler).toHaveBeenCalledTimes(1);
    });

    it("should not fail if no events", async () => {
      const result = await dispatcher.dispatchAll([]);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("getHandlerCount()", () => {
    it("should return correct count of handlers", () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      dispatcher.subscribe("TestEvent", handler1);
      dispatcher.subscribe("TestEvent", handler2);

      expect(dispatcher.getHandlerCount("TestEvent")).toBe(2);
    });

    it("should return 0 when no handlers", () => {
      expect(dispatcher.getHandlerCount("TestEvent")).toBe(0);
    });
  });

  describe("clearHandlers()", () => {
    it("should remove all registered handlers", () => {
      const handler1 = vi.fn().mockReturnValue(Result.ok());
      const handler2 = vi.fn().mockReturnValue(Result.ok());
      dispatcher.subscribe("TestEvent", handler1);
      dispatcher.subscribe("AnotherEvent", handler2);

      dispatcher.clearHandlers();

      expect(dispatcher.getHandlerCount("TestEvent")).toBe(0);
      expect(dispatcher.getHandlerCount("AnotherEvent")).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle mixed sync and async handlers", async () => {
      const syncHandler = vi.fn().mockReturnValue(Result.ok());
      const asyncHandler = vi.fn().mockResolvedValue(Result.ok());
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", syncHandler);
      dispatcher.subscribe("TestEvent", asyncHandler);

      await dispatcher.dispatch(event);

      expect(syncHandler).toHaveBeenCalled();
      expect(asyncHandler).toHaveBeenCalled();
    });

    it("should execute handlers in subscription order", async () => {
      const callOrder: number[] = [];
      const handler1 = vi.fn().mockImplementation(() => {
        callOrder.push(1);
        return Result.ok();
      });
      const handler2 = vi.fn().mockImplementation(() => {
        callOrder.push(2);
        return Result.ok();
      });
      const handler3 = vi.fn().mockImplementation(() => {
        callOrder.push(3);
        return Result.ok();
      });
      const event = createTestEvent("entity-1", "test data");

      dispatcher.subscribe("TestEvent", handler1);
      dispatcher.subscribe("TestEvent", handler2);
      dispatcher.subscribe("TestEvent", handler3);

      await dispatcher.dispatch(event);

      expect(callOrder).toEqual([1, 2, 3]);
    });
  });
});
