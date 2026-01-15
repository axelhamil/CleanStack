# DDD-004: Aggregate Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for Aggregate<T>
**So that** aggregate root behavior is reliable

## Acceptance Criteria

- [ ] Test aggregate creation (extends Entity)
- [ ] Test `domainEvents` collection
- [ ] Test `addEvent(event)` method
- [ ] Test `clearEvents()` method
- [ ] Test events are preserved through operations
- [ ] Test events cleared after dispatch
- [ ] Coverage > 95% on Aggregate.ts

## Test Cases

```typescript
class UserCreated implements IDomainEvent {
  constructor(public readonly userId: string) {}
  dateOccurred = new Date();
  getAggregateId() { return this.userId; }
}

class TestAggregate extends Aggregate<{ name: string }> {
  static create(name: string): TestAggregate {
    const aggregate = new TestAggregate({ name }, new UUID());
    aggregate.addEvent(new UserCreated(aggregate._id.value));
    return aggregate;
  }

  changeName(name: string): void {
    this._props.name = name;
  }
}

describe('Aggregate', () => {
  describe('domainEvents', () => {
    it('should start with empty events', () => {
      const aggregate = new TestAggregate({ name: 'Test' });
      expect(aggregate.domainEvents).toHaveLength(0);
    });
  });

  describe('addEvent', () => {
    it('should add event to collection', () => {
      const aggregate = TestAggregate.create('John');
      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate.domainEvents[0]).toBeInstanceOf(UserCreated);
    });

    it('should accumulate multiple events', () => {
      const aggregate = TestAggregate.create('John');
      aggregate.addEvent(new UserCreated('another'));
      expect(aggregate.domainEvents).toHaveLength(2);
    });
  });

  describe('clearEvents', () => {
    it('should remove all events', () => {
      const aggregate = TestAggregate.create('John');
      expect(aggregate.domainEvents).toHaveLength(1);

      aggregate.clearEvents();
      expect(aggregate.domainEvents).toHaveLength(0);
    });
  });

  describe('events through operations', () => {
    it('should preserve events after prop changes', () => {
      const aggregate = TestAggregate.create('John');
      aggregate.changeName('Jane');

      expect(aggregate.domainEvents).toHaveLength(1);
      expect(aggregate._props.name).toBe('Jane');
    });
  });
});
```

## Definition of Done

- [ ] All test cases pass
- [ ] Coverage > 95%
- [ ] Edge cases covered
