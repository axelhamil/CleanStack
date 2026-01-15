# TST-001: User Domain Tests

## Story

**As a** developer
**I want** comprehensive tests for User domain
**So that** user aggregate is reliable

## Acceptance Criteria

- [ ] Test User aggregate creation
- [ ] Test User value objects (Email, Name, Password)
- [ ] Test User domain events
- [ ] Test User methods
- [ ] Coverage > 90%

## Test Cases

### User Aggregate

```typescript
describe('User Aggregate', () => {
  describe('create', () => {
    it('should create user with valid props', () => {
      const email = Email.create('test@example.com').getValue();
      const name = Name.create('John').getValue();

      const user = User.create({ email, name });

      expect(user.email.value).toBe('test@example.com');
      expect(user.name.value).toBe('John');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should emit UserCreatedEvent on creation', () => {
      const user = User.create({ email, name });

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UserCreatedEvent);
    });
  });

  describe('verifyEmail', () => {
    it('should mark email as verified', () => {
      const user = User.create({ email, name });
      user.verifyEmail();

      expect(user.emailVerified).toBe(true);
      expect(user.emailVerifiedAt).toBeInstanceOf(Date);
    });

    it('should emit UserEmailVerifiedEvent', () => {
      const user = User.create({ email, name });
      user.clearEvents();

      user.verifyEmail();

      expect(user.domainEvents).toHaveLength(1);
      expect(user.domainEvents[0]).toBeInstanceOf(UserEmailVerifiedEvent);
    });

    it('should not emit event if already verified', () => {
      const user = User.create({ email, name });
      user.verifyEmail();
      user.clearEvents();

      user.verifyEmail();

      expect(user.domainEvents).toHaveLength(0);
    });
  });
});
```

### Email Value Object

```typescript
describe('Email', () => {
  it('should create valid email', () => {
    const result = Email.create('test@example.com');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().value).toBe('test@example.com');
  });

  it('should fail for invalid email', () => {
    const result = Email.create('invalid-email');
    expect(result.isFailure).toBe(true);
  });

  it('should normalize to lowercase', () => {
    const result = Email.create('TEST@EXAMPLE.COM');
    expect(result.getValue().value).toBe('test@example.com');
  });

  it('should be equal by value', () => {
    const email1 = Email.create('test@example.com').getValue();
    const email2 = Email.create('test@example.com').getValue();
    expect(email1.equals(email2)).toBe(true);
  });
});
```

### Name Value Object

```typescript
describe('Name', () => {
  it('should create valid name', () => {
    const result = Name.create('John Doe');
    expect(result.isSuccess).toBe(true);
  });

  it('should fail for empty name', () => {
    const result = Name.create('');
    expect(result.isFailure).toBe(true);
  });

  it('should fail for name too long', () => {
    const result = Name.create('a'.repeat(101));
    expect(result.isFailure).toBe(true);
  });
});
```

## Definition of Done

- [ ] All tests pass
- [ ] Coverage > 90%
- [ ] Edge cases covered
