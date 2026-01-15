# EVT-005: User Domain Events

## Story

**As a** developer
**I want** domain events for User aggregate
**So that** side effects can react to user lifecycle

## Acceptance Criteria

- [ ] `UserCreatedEvent` - emitted on sign up
- [ ] `UserEmailVerifiedEvent` - emitted on email verification
- [ ] `UserSignedInEvent` - emitted on sign in (optional, for audit)
- [ ] Events contain necessary payload
- [ ] Events emitted in aggregate methods

## Technical Notes

### Events

```typescript
// src/domain/user/events/user-created.event.ts
export class UserCreatedEvent extends DomainEvent<{
  userId: string;
  email: string;
  name: string;
}> {
  readonly eventType = 'user.created';

  constructor(user: User) {
    super();
    this.aggregateId = user.id.value;
    this.payload = {
      userId: user.id.value,
      email: user.email.value,
      name: user.name.value,
    };
  }
}
```

```typescript
// src/domain/user/events/user-email-verified.event.ts
export class UserEmailVerifiedEvent extends DomainEvent<{
  userId: string;
  email: string;
  verifiedAt: Date;
}> {
  readonly eventType = 'user.email_verified';

  constructor(user: User) {
    super();
    this.aggregateId = user.id.value;
    this.payload = {
      userId: user.id.value,
      email: user.email.value,
      verifiedAt: new Date(),
    };
  }
}
```

### Aggregate Integration

```typescript
// src/domain/user/user.aggregate.ts
export class User extends Aggregate<IUserProps> {
  static create(props: CreateUserProps, id?: UUID): User {
    const user = new User(
      { ...props, createdAt: new Date(), emailVerified: false },
      id ?? new UUID()
    );
    user.addEvent(new UserCreatedEvent(user));
    return user;
  }

  verifyEmail(): void {
    if (this._props.emailVerified) return;

    this._props.emailVerified = true;
    this._props.emailVerifiedAt = new Date();
    this.addEvent(new UserEmailVerifiedEvent(this));
  }
}
```

## Definition of Done

- [ ] Events created
- [ ] Emitted in aggregate
- [ ] Handler examples documented
