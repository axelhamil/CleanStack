# DDD-001: Result Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for Result<T,E>
**So that** the primitive is reliable for all consumers

## Acceptance Criteria

- [ ] Test `Result.ok(value)` - creates success
- [ ] Test `Result.fail(error)` - creates failure
- [ ] Test `Result.combine([])` - returns first failure or ok
- [ ] Test `isSuccess` / `isFailure` properties
- [ ] Test `getValue()` - throws on failure
- [ ] Test `getError()` - throws on success
- [ ] Test `map()` / `flatMap()` if implemented
- [ ] Coverage > 95% on Result.ts

## Test Cases

```typescript
describe('Result', () => {
  describe('ok', () => {
    it('should create a success result with value', () => {
      const result = Result.ok(42);
      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(42);
    });
  });

  describe('fail', () => {
    it('should create a failure result with error', () => {
      const result = Result.fail('error');
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('error');
    });
  });

  describe('combine', () => {
    it('should return ok when all results are successful', () => {
      const results = [Result.ok(1), Result.ok(2), Result.ok(3)];
      const combined = Result.combine(results);
      expect(combined.isSuccess).toBe(true);
    });

    it('should return first failure when any result fails', () => {
      const results = [Result.ok(1), Result.fail('first'), Result.fail('second')];
      const combined = Result.combine(results);
      expect(combined.isFailure).toBe(true);
      expect(combined.getError()).toBe('first');
    });
  });

  describe('getValue', () => {
    it('should throw when called on failure', () => {
      const result = Result.fail('error');
      expect(() => result.getValue()).toThrow();
    });
  });

  describe('getError', () => {
    it('should throw when called on success', () => {
      const result = Result.ok(42);
      expect(() => result.getError()).toThrow();
    });
  });
});
```

## Definition of Done

- [ ] All test cases pass
- [ ] Coverage > 95%
- [ ] Edge cases covered
