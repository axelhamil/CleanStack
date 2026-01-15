# DDD-003: Entity Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for Entity<T>
**So that** entity behavior is predictable

## Acceptance Criteria

- [x] Test entity creation with props
- [x] Test `_id` getter
- [x] Test `_props` access
- [x] Test `get('prop')` method
- [x] Test `getProps()` returns all props
- [x] Test `toObject()` serialization
- [x] Test `clone()` with overrides
- [x] Test equality comparison
- [x] Coverage > 95% on Entity.ts (100%)

## Test Cases

```typescript
class TestEntity extends Entity<{ name: string; age: number }> {
  get name() { return this._props.name; }
  get age() { return this._props.age; }
}

describe('Entity', () => {
  describe('creation', () => {
    it('should create entity with props and id', () => {
      const id = new UUID();
      const entity = new TestEntity({ name: 'John', age: 30 }, id);

      expect(entity._id.equals(id)).toBe(true);
      expect(entity.name).toBe('John');
      expect(entity.age).toBe(30);
    });

    it('should generate id if not provided', () => {
      const entity = new TestEntity({ name: 'John', age: 30 });
      expect(entity._id).toBeDefined();
    });
  });

  describe('get', () => {
    it('should return prop value by key', () => {
      const entity = new TestEntity({ name: 'John', age: 30 });
      expect(entity.get('name')).toBe('John');
      expect(entity.get('age')).toBe(30);
    });
  });

  describe('getProps', () => {
    it('should return all props', () => {
      const entity = new TestEntity({ name: 'John', age: 30 });
      const props = entity.getProps();
      expect(props).toEqual({ name: 'John', age: 30 });
    });
  });

  describe('toObject', () => {
    it('should serialize entity with id', () => {
      const entity = new TestEntity({ name: 'John', age: 30 });
      const obj = entity.toObject();
      expect(obj.id).toBeDefined();
      expect(obj.name).toBe('John');
      expect(obj.age).toBe(30);
    });
  });

  describe('clone', () => {
    it('should create copy with same props', () => {
      const entity = new TestEntity({ name: 'John', age: 30 });
      const clone = entity.clone();
      expect(clone.name).toBe('John');
      expect(clone._id.equals(entity._id)).toBe(false); // new id
    });

    it('should override props when provided', () => {
      const entity = new TestEntity({ name: 'John', age: 30 });
      const clone = entity.clone({ name: 'Jane' });
      expect(clone.name).toBe('Jane');
      expect(clone.age).toBe(30);
    });
  });

  describe('equality', () => {
    it('should be equal when ids match', () => {
      const id = new UUID();
      const entity1 = new TestEntity({ name: 'John', age: 30 }, id);
      const entity2 = new TestEntity({ name: 'Jane', age: 25 }, id);
      expect(entity1.equals(entity2)).toBe(true);
    });

    it('should not be equal when ids differ', () => {
      const entity1 = new TestEntity({ name: 'John', age: 30 });
      const entity2 = new TestEntity({ name: 'John', age: 30 });
      expect(entity1.equals(entity2)).toBe(false);
    });
  });
});
```

## Definition of Done

- [x] All test cases pass (28 tests)
- [x] Coverage > 95% (100%)
- [x] Edge cases covered
