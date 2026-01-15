# DDD-006: UUID Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for UUID
**So that** identity handling is reliable

## Acceptance Criteria

- [x] Test UUID generation (random)
- [x] Test UUID from string
- [x] Test UUID from number
- [x] Test `value` getter
- [x] Test `equals()` comparison
- [x] Test `toString()` format (via create() method)
- [x] Test typed UUID subclasses
- [x] Coverage > 95% on UUID.ts (100%)

## Test Cases

```typescript
class UserId extends UUID<string> {
  protected [Symbol.toStringTag] = 'UserId';
  static create(uuid: UUID): UserId {
    return new UserId(uuid.value);
  }
}

describe('UUID', () => {
  describe('generation', () => {
    it('should generate valid UUID', () => {
      const uuid = new UUID();
      expect(uuid.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = new UUID();
      const uuid2 = new UUID();
      expect(uuid1.value).not.toBe(uuid2.value);
    });
  });

  describe('from string', () => {
    it('should create UUID from valid string', () => {
      const value = '550e8400-e29b-41d4-a716-446655440000';
      const uuid = new UUID(value);
      expect(uuid.value).toBe(value);
    });
  });

  describe('from number', () => {
    it('should create UUID from number', () => {
      const uuid = new UUID(123);
      expect(uuid.value).toBe(123);
    });
  });

  describe('equals', () => {
    it('should return true for same value', () => {
      const value = '550e8400-e29b-41d4-a716-446655440000';
      const uuid1 = new UUID(value);
      const uuid2 = new UUID(value);
      expect(uuid1.equals(uuid2)).toBe(true);
    });

    it('should return false for different values', () => {
      const uuid1 = new UUID();
      const uuid2 = new UUID();
      expect(uuid1.equals(uuid2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const value = '550e8400-e29b-41d4-a716-446655440000';
      const uuid = new UUID(value);
      expect(uuid.toString()).toContain(value);
    });
  });

  describe('typed UUID subclass', () => {
    it('should create typed UUID', () => {
      const uuid = new UUID();
      const userId = UserId.create(uuid);
      expect(userId.value).toBe(uuid.value);
    });

    it('should maintain type identity', () => {
      const userId = UserId.create(new UUID());
      expect(userId[Symbol.toStringTag]).toBe('UserId');
    });
  });
});
```

## Definition of Done

- [x] All test cases pass (18 tests)
- [x] Coverage > 95% (100%)
- [x] Edge cases covered
