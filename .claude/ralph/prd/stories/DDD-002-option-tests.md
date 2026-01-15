# DDD-002: Option Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for Option<T>
**So that** null handling is reliable

## Acceptance Criteria

- [x] Test `Option.some(value)` - creates Some
- [x] Test `Option.none()` - creates None
- [x] Test `Option.fromNullable()` - Some if value, None if null/undefined
- [x] Test `isSome()` / `isNone()` methods
- [x] Test `unwrap()` - throws on None
- [x] Test `unwrapOr(default)` - returns default on None
- [x] Test `map()` / `flatMap()` transformations
- [x] Test `match()` pattern matching
- [x] Coverage > 95% on Option.ts (100%)

## Test Cases

```typescript
describe('Option', () => {
  describe('some', () => {
    it('should create Some with value', () => {
      const option = Option.some(42);
      expect(option.isSome()).toBe(true);
      expect(option.unwrap()).toBe(42);
    });
  });

  describe('none', () => {
    it('should create None', () => {
      const option = Option.none<number>();
      expect(option.isNone()).toBe(true);
    });
  });

  describe('fromNullable', () => {
    it('should return Some for non-null value', () => {
      const option = Option.fromNullable(42);
      expect(option.isSome()).toBe(true);
    });

    it('should return None for null', () => {
      const option = Option.fromNullable(null);
      expect(option.isNone()).toBe(true);
    });

    it('should return None for undefined', () => {
      const option = Option.fromNullable(undefined);
      expect(option.isNone()).toBe(true);
    });
  });

  describe('unwrap', () => {
    it('should throw on None', () => {
      const option = Option.none();
      expect(() => option.unwrap()).toThrow();
    });
  });

  describe('unwrapOr', () => {
    it('should return default on None', () => {
      const option = Option.none<number>();
      expect(option.unwrapOr(100)).toBe(100);
    });

    it('should return value on Some', () => {
      const option = Option.some(42);
      expect(option.unwrapOr(100)).toBe(42);
    });
  });

  describe('map', () => {
    it('should transform Some value', () => {
      const option = Option.some(42).map(x => x * 2);
      expect(option.unwrap()).toBe(84);
    });

    it('should return None when mapping None', () => {
      const option = Option.none<number>().map(x => x * 2);
      expect(option.isNone()).toBe(true);
    });
  });

  describe('match', () => {
    it('should call Some handler for Some', () => {
      const result = match(Option.some(42), {
        Some: v => `value: ${v}`,
        None: () => 'empty'
      });
      expect(result).toBe('value: 42');
    });

    it('should call None handler for None', () => {
      const result = match(Option.none(), {
        Some: v => `value: ${v}`,
        None: () => 'empty'
      });
      expect(result).toBe('empty');
    });
  });
});
```

## Definition of Done

- [x] All test cases pass (56 tests)
- [x] Coverage > 95% (100%)
- [x] Edge cases covered
