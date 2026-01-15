# DDD-005: ValueObject Tests

## Story

**As a** ddd-kit maintainer
**I want** comprehensive tests for ValueObject<T>
**So that** value object validation is reliable

## Acceptance Criteria

- [ ] Test successful creation with valid value
- [ ] Test failed creation with invalid value
- [ ] Test `value` getter
- [ ] Test validation via Result
- [ ] Test equality by value (not reference)
- [ ] Test immutability
- [ ] Coverage > 95% on ValueObject.ts

## Test Cases

```typescript
class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    if (!value.includes('@')) {
      return Result.fail('Invalid email format');
    }
    return Result.ok(value.toLowerCase());
  }
}

class Age extends ValueObject<number> {
  protected validate(value: number): Result<number> {
    if (value < 0 || value > 150) {
      return Result.fail('Age must be between 0 and 150');
    }
    return Result.ok(value);
  }
}

describe('ValueObject', () => {
  describe('create', () => {
    it('should succeed with valid value', () => {
      const result = Email.create('test@example.com');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe('test@example.com');
    });

    it('should fail with invalid value', () => {
      const result = Email.create('invalid-email');
      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe('Invalid email format');
    });

    it('should transform value during validation', () => {
      const result = Email.create('TEST@EXAMPLE.COM');
      expect(result.getValue().value).toBe('test@example.com');
    });
  });

  describe('value', () => {
    it('should return the inner value', () => {
      const email = Email.create('test@example.com').getValue();
      expect(email.value).toBe('test@example.com');
    });
  });

  describe('equality', () => {
    it('should be equal when values match', () => {
      const email1 = Email.create('test@example.com').getValue();
      const email2 = Email.create('test@example.com').getValue();
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const email1 = Email.create('test1@example.com').getValue();
      const email2 = Email.create('test2@example.com').getValue();
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('number value objects', () => {
    it('should validate numeric constraints', () => {
      const validAge = Age.create(25);
      expect(validAge.isSuccess).toBe(true);

      const invalidAge = Age.create(-5);
      expect(invalidAge.isFailure).toBe(true);

      const tooOld = Age.create(200);
      expect(tooOld.isFailure).toBe(true);
    });
  });

  describe('immutability', () => {
    it('should not allow value mutation', () => {
      const email = Email.create('test@example.com').getValue();
      // TypeScript should prevent: email.value = 'new@example.com'
      expect(email.value).toBe('test@example.com');
    });
  });
});
```

## Definition of Done

- [ ] All test cases pass
- [ ] Coverage > 95%
- [ ] Edge cases covered
