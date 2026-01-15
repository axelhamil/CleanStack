import { beforeEach, describe, expect, it } from "vitest";
import { Aggregate, type DomainEvent, DomainEvents, UUID } from "../index";

class UserCreated implements DomainEvent {
  type = "UserCreated";
  dateTimeOccurred = new Date();
  aggregateId: string;

  constructor(aggregateId: string) {
    this.aggregateId = aggregateId;
  }
}

class UserNameChanged implements DomainEvent {
  type = "UserNameChanged";
  dateTimeOccurred = new Date();
  aggregateId: string;

  constructor(
    aggregateId: string,
    public readonly newName: string,
  ) {
    this.aggregateId = aggregateId;
  }
}

interface TestAggregateProps {
  name: string;
  age: number;
}

class TestAggregate extends Aggregate<TestAggregateProps> {
  get name(): string {
    return this._props.name;
  }

  get age(): number {
    return this._props.age;
  }

  static create(
    props: TestAggregateProps,
    id?: UUID<string | number>,
  ): TestAggregate {
    const aggregate = new TestAggregate(props, id ?? new UUID());
    aggregate.addEvent(new UserCreated(aggregate._id.value.toString()));
    return aggregate;
  }

  static createWithoutEvent(
    props: TestAggregateProps,
    id?: UUID<string | number>,
  ): TestAggregate {
    return new TestAggregate(props, id);
  }

  changeName(newName: string): void {
    this._props.name = newName;
    this.addEvent(new UserNameChanged(this._id.value.toString(), newName));
  }

  addMultipleEvents(events: DomainEvent[]): void {
    this.addEvents(events);
  }

  addSingleEvent(event: DomainEvent): void {
    this.addEvent(event);
  }

  addDomainEventAlias(event: DomainEvent): void {
    this.addDomainEvent(event);
  }
}

describe("Aggregate", () => {
  beforeEach(() => {
    DomainEvents.clearEvents();
    DomainEvents.clearHandlers();
    DomainEvents.setLogging(false);
  });

  describe("creation", () => {
    it("should create aggregate with props and id", () => {
      const id = new UUID();
      const aggregate = TestAggregate.createWithoutEvent(
        { name: "John", age: 30 },
        id,
      );

      expect(aggregate._id.equals(id)).toBe(true);
      expect(aggregate.name).toBe("John");
      expect(aggregate.age).toBe(30);
    });

    it("should generate id if not provided", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });

      expect(aggregate._id).toBeDefined();
      expect(aggregate._id).toBeInstanceOf(UUID);
    });

    it("should extend Entity", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });

      expect(aggregate.get("name")).toBe("John");
      expect(aggregate.getProps()).toEqual({ name: "John", age: 30 });
    });
  });

  describe("domainEvents", () => {
    it("should start with empty events when created without event", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "Test",
        age: 25,
      });

      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it("should have events when created with addEvent in factory", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBeInstanceOf(UserCreated);
    });

    it("should return a copy of events (immutable)", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      const events1 = aggregate.domainEvents;
      const events2 = aggregate.domainEvents;

      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });
  });

  describe("addEvent()", () => {
    it("should add event to collection", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBeInstanceOf(UserCreated);
    });

    it("should accumulate multiple events", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.changeName("Jane");

      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.domainEvents[0]).toBeInstanceOf(UserCreated);
      expect(aggregate.domainEvents[1]).toBeInstanceOf(UserNameChanged);
    });

    it("should register event with DomainEvents", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      expect(DomainEvents.hasEvents(aggregate._id.value.toString())).toBe(true);
    });
  });

  describe("addDomainEvent() alias", () => {
    it("should work same as addEvent", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.addDomainEventAlias(
        new UserNameChanged(aggregate._id.value.toString(), "Test"),
      );

      expect(aggregate.domainEvents).toHaveLength(2);
    });
  });

  describe("addEvents()", () => {
    it("should add multiple events at once", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });
      const events = [
        new UserCreated(aggregate._id.value.toString()),
        new UserNameChanged(aggregate._id.value.toString(), "Jane"),
      ];

      aggregate.addMultipleEvents(events);

      expect(aggregate.domainEvents).toHaveLength(2);
    });

    it("should register all events with DomainEvents", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });
      const events = [
        new UserCreated(aggregate._id.value.toString()),
        new UserNameChanged(aggregate._id.value.toString(), "Jane"),
      ];

      aggregate.addMultipleEvents(events);

      const registeredEvents = DomainEvents.getEventsForEntity(
        aggregate._id.value.toString(),
      );
      expect(registeredEvents.isSome()).toBe(true);
      expect(registeredEvents.unwrap()).toHaveLength(2);
    });
  });

  describe("clearEvents()", () => {
    it("should remove all events from aggregate", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.changeName("Jane");
      expect(aggregate.domainEvents).toHaveLength(2);

      aggregate.clearEvents();

      expect(aggregate.domainEvents).toHaveLength(0);
    });

    it("should not affect DomainEvents registry", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      const aggregateId = aggregate._id.value.toString();

      aggregate.clearEvents();

      expect(DomainEvents.hasEvents(aggregateId)).toBe(true);
    });
  });

  describe("hasEvents()", () => {
    it("should return true when aggregate has events", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      expect(aggregate.hasEvents()).toBe(true);
    });

    it("should return false when aggregate has no events", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });

      expect(aggregate.hasEvents()).toBe(false);
    });

    it("should return false after clearing events", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.clearEvents();

      expect(aggregate.hasEvents()).toBe(false);
    });
  });

  describe("getEventCount()", () => {
    it("should return 0 for new aggregate without events", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });

      expect(aggregate.getEventCount()).toBe(0);
    });

    it("should return correct count", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.changeName("Jane");
      aggregate.changeName("Alice");

      expect(aggregate.getEventCount()).toBe(3);
    });

    it("should return 0 after clearing", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.clearEvents();

      expect(aggregate.getEventCount()).toBe(0);
    });
  });

  describe("markEventsForDispatch()", () => {
    it("should register all events for dispatch", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.changeName("Jane");

      DomainEvents.clearEvents();
      expect(DomainEvents.hasEvents(aggregate._id.value.toString())).toBe(
        false,
      );

      const result = aggregate.markEventsForDispatch();

      expect(result.isSuccess).toBe(true);
      expect(DomainEvents.hasEvents(aggregate._id.value.toString())).toBe(true);
    });

    it("should succeed with empty events", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });

      const result = aggregate.markEventsForDispatch();

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("events preservation", () => {
    it("should preserve events after prop changes", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.changeName("Jane");

      expect(aggregate.domainEvents).toHaveLength(2);
      expect(aggregate.name).toBe("Jane");
    });

    it("should preserve events through getProps()", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      aggregate.getProps();

      expect(aggregate.domainEvents).toHaveLength(1);
    });

    it("should preserve events through toObject()", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      aggregate.toObject();

      expect(aggregate.domainEvents).toHaveLength(1);
    });
  });

  describe("Entity inheritance", () => {
    it("should support clone()", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      const clone = aggregate.clone({ name: "Jane" });

      expect((clone as TestAggregate).name).toBe("Jane");
      expect((clone as TestAggregate).age).toBe(30);
      expect(clone._id.equals(aggregate._id)).toBe(true);
    });

    it("should support equals()", () => {
      const id = new UUID();
      const aggregate1 = TestAggregate.createWithoutEvent(
        { name: "John", age: 30 },
        id,
      );
      const aggregate2 = TestAggregate.createWithoutEvent(
        { name: "Jane", age: 25 },
        id,
      );

      expect(aggregate1.equals(aggregate2)).toBe(true);
    });

    it("should support toObject()", () => {
      const aggregate = TestAggregate.createWithoutEvent({
        name: "John",
        age: 30,
      });
      const obj = aggregate.toObject();

      expect(obj.id).toBeDefined();
      expect(obj.name).toBe("John");
      expect(obj.age).toBe(30);
    });
  });

  describe("event types", () => {
    it("should correctly identify event types", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });
      aggregate.changeName("Jane");

      const events = aggregate.domainEvents;
      expect(events[0].type).toBe("UserCreated");
      expect(events[1].type).toBe("UserNameChanged");
    });

    it("should set correct aggregateId on events", () => {
      const id = new UUID("test-id");
      const aggregate = TestAggregate.create({ name: "John", age: 30 }, id);

      expect(aggregate.domainEvents[0].aggregateId).toBe("test-id");
    });

    it("should set dateTimeOccurred on events", () => {
      const aggregate = TestAggregate.create({ name: "John", age: 30 });

      expect(aggregate.domainEvents[0].dateTimeOccurred).toBeInstanceOf(Date);
    });
  });
});
