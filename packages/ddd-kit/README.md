# ddd-kit

DDD primitives for TypeScript. Railway-oriented programming with Result/Option monads, Entity/Aggregate patterns, and type-safe value objects.

## Installation

```bash
npm install ddd-kit
# or
pnpm add ddd-kit
```

## Features

- **Result<T, E>** - Railway-oriented error handling
- **Option<T>** - Null-safe value handling
- **Entity<T>** - Identity-based domain objects
- **Aggregate<T>** - Aggregate roots with domain events
- **ValueObject<T>** - Immutable value types with validation
- **UUID** - Type-safe identifiers
- **WatchedList<T>** - Change-tracked collections
- **DomainEvents** - Event dispatch system
- **BaseRepository<T>** - Repository interface with pagination

## Usage

### Result

```typescript
import { Result } from "ddd-kit";

const divide = (a: number, b: number): Result<number, string> => {
  if (b === 0) return Result.fail("Cannot divide by zero");
  return Result.ok(a / b);
};

const result = divide(10, 2);
if (result.isSuccess) {
  console.log(result.getValue()); // 5
}

// Combine multiple results
const combined = Result.combine([
  Result.ok(1),
  Result.ok(2),
  Result.fail("error"),
]);
// combined.isFailure === true
```

### Option

```typescript
import { Option, match } from "ddd-kit";

const findUser = (id: string): Option<User> => {
  const user = db.find(id);
  return Option.fromNullable(user);
};

const user = findUser("123");
const name = user.map((u) => u.name).unwrapOr("Anonymous");

// Pattern matching
match(user, {
  Some: (u) => console.log(u.name),
  None: () => console.log("User not found"),
});
```

### Entity & Aggregate

```typescript
import { Entity, Aggregate, UUID } from "ddd-kit";

interface UserProps {
  name: string;
  email: string;
}

class User extends Aggregate<UserProps> {
  get name() {
    return this._props.name;
  }

  static create(props: UserProps, id?: UUID): User {
    return new User(props, id ?? new UUID());
  }

  updateName(name: string): void {
    this._props.name = name;
    this.addEvent({ type: "UserNameUpdated", aggregateId: this._id.value });
  }
}
```

### ValueObject

```typescript
import { ValueObject, Result } from "ddd-kit";

class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    if (!value.includes("@")) {
      return Result.fail("Invalid email format");
    }
    return Result.ok(value);
  }
}

const email = Email.create("test@example.com");
if (email.isSuccess) {
  console.log(email.getValue().value); // "test@example.com"
}
```

### BaseRepository

```typescript
import { BaseRepository, PaginatedResult, Result, Option } from "ddd-kit";

class UserRepository implements BaseRepository<User> {
  async findAll(pagination?: PaginationParams): Promise<Result<PaginatedResult<User>>> {
    // Implementation
  }

  async findById(id: UUID): Promise<Result<Option<User>>> {
    // Implementation
  }

  // ... other methods
}
```

## API

### Result<T, E>

| Method | Description |
|--------|-------------|
| `Result.ok(value)` | Create success result |
| `Result.fail(error)` | Create failure result |
| `Result.combine(results)` | Combine multiple results |
| `result.isSuccess` | Check if success |
| `result.isFailure` | Check if failure |
| `result.getValue()` | Get value (throws if failure) |
| `result.getError()` | Get error (throws if success) |

### Option<T>

| Method | Description |
|--------|-------------|
| `Option.some(value)` | Create Some |
| `Option.none()` | Create None |
| `Option.fromNullable(value)` | Some if value, None if null |
| `option.isSome()` | Check if Some |
| `option.isNone()` | Check if None |
| `option.unwrap()` | Get value (throws if None) |
| `option.unwrapOr(default)` | Get value or default |
| `option.map(fn)` | Transform value |
| `option.flatMap(fn)` | Chain operations |

## License

MIT
