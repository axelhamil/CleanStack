# Core Concepts

DDD primitives for type-safe, explicit error handling.

## Result Pattern

Explicit error handling without exceptions.

### Why Result?

```typescript
// ❌ Exception - can crash anywhere
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

// ✅ Result - explicit, type-safe
function divide(a: number, b: number): Result<number> {
  if (b === 0) return Result.fail('Division by zero')
  return Result.ok(a / b)
}
```

### API

```typescript
// Success
const success = Result.ok(42)
success.isSuccess  // true
success.value      // 42

// Failure
const failure = Result.fail('error')
failure.isFailure  // true
failure.error      // 'error'
```

### Chaining

```typescript
async execute(input: CreateUserInput): Promise<Result<User>> {
  const emailOrError = Email.create(input.email)
  if (emailOrError.isFailure) return Result.fail(emailOrError.error)

  const userOrError = User.create({ email: emailOrError.value })
  if (userOrError.isFailure) return Result.fail(userOrError.error)

  return await this.repo.create(userOrError.value)
}
```

### Combining

```typescript
const email = Email.create(input.email)
const name = UserName.create(input.name)

const combined = Result.combine([email, name])
if (combined.isFailure) return Result.fail(combined.error)

// All succeeded
```

### Usage Patterns

```typescript
// Value Objects
static create(email: string): Result<Email> {
  if (!EMAIL_REGEX.test(email)) return Result.fail('Invalid email')
  return Result.ok(new Email({ value: email.toLowerCase() }))
}

// Use Cases
async execute(input: Input): Promise<Result<User>> {
  // All operations return Result
}

// Repositories
async create(user: User): Promise<Result<User>>
async findById(id: UUID): Promise<Result<Option<User>>>

// Controllers
const result = await useCase.execute(input)
if (result.isFailure) {
  return Response.json({ error: result.error }, { status: 400 })
}
return Response.json(result.value, { status: 201 })
```

### Rules

**Do:**
```typescript
return Result.fail('error')
return Result.ok(value)
if (result.isFailure) return Result.fail(result.error)
```

**Don't:**
```typescript
throw new Error('...')     // Never in Domain/Application
return null                // Use Result.fail or Option
result.value               // Without checking isSuccess first
```

---

## Option Pattern

Handle absence of value without `null`.

### Why Option?

```typescript
// ❌ Null - easy to forget check
const user = await findUser(id) // User | null
console.log(user.email) // Can crash!

// ✅ Option - forced handling
const result = await findUser(id) // Result<Option<User>>
match(result.value, {
  Some: (user) => console.log(user.email),
  None: () => console.log('Not found')
})
```

### API

```typescript
import { Option, match } from '@packages/ddd-kit'

// Present value
const some = Option.some({ id: '1', name: 'Alice' })
some.isSome()   // true
some.unwrap()   // { id: '1', name: 'Alice' }

// Absent value
const none = Option.none<User>()
none.isNone()   // true
// none.unwrap() // Throws!
```

### Pattern Matching

```typescript
import { match } from '@packages/ddd-kit'

const message = match(userOption, {
  Some: (user) => `Hello, ${user.name}!`,
  None: () => 'User not found'
})
```

### Useful Methods

```typescript
// map - transform if present
userOption.map(user => user.name) // Option<string>

// flatMap - chain Options
userOption.flatMap(user => findManager(user.managerId))

// unwrapOr - default value
userOption.unwrapOr(guestUser)

// filter - filter by predicate
userOption.filter(user => user.age >= 18)
```

### In Repositories

```typescript
async findById(id: UUID): Promise<Result<Option<User>>> {
  const row = await db.query.users.findFirst({ where: eq(users.id, id.value) })
  if (!row) return Result.ok(Option.none())
  return Result.ok(Option.some(UserMapper.toDomain(row).value))
}
```

### In Use Cases

```typescript
async execute(userId: string): Promise<Result<User>> {
  const result = await this.userRepo.findById(UUID.createFrom(userId).value)
  if (result.isFailure) return Result.fail(result.error)

  return match(result.value, {
    Some: (user) => Result.ok(user),
    None: () => Result.fail(new NotFoundException('User not found'))
  })
}
```

### Rules

**Do:**
```typescript
return Result.ok(Option.none())        // Explicit absence
return Result.ok(Option.some(user))    // Explicit presence
match(option, { Some: ..., None: ... }) // Pattern matching
option.unwrapOr(defaultValue)          // Safe default
```

**Don't:**
```typescript
return null                // Use Option.none()
option.unwrap()           // Without checking isSome()
option.match({ ... })     // match is external function
```

---

## Value Objects

Immutable, validated business concepts.

### Definition

Value Objects are defined by their **attributes**, not identity. Two emails with same value are equal.

```typescript
const email1 = Email.create({ value: 'user@example.com' }).value
const email2 = Email.create({ value: 'user@example.com' }).value
email1.equals(email2) // true
```

### Structure

```typescript
import { Result, ValueObject } from '@packages/ddd-kit'

interface EmailProps {
  value: string
}

export class Email extends ValueObject<EmailProps> {
  // Only implement validate() - parent provides create(), equals(), value
  protected validate(props: EmailProps): Result<EmailProps> {
    if (!EMAIL_REGEX.test(props.value)) {
      return Result.fail('Invalid email format')
    }
    // Return normalized value
    return Result.ok({ value: props.value.toLowerCase().trim() })
  }
}
```

### Usage

```typescript
// Create
const emailResult = Email.create({ value: 'USER@EXAMPLE.COM' })

if (emailResult.isFailure) return Result.fail(emailResult.error)

const email = emailResult.value
console.log(email.value.value) // "user@example.com"

// Comparison
email1.equals(email2) // Compares all props
```

### Example: Money

```typescript
interface MoneyProps {
  amount: number
  currency: 'EUR' | 'USD' | 'GBP'
}

export class Money extends ValueObject<MoneyProps> {
  protected validate(props: MoneyProps): Result<MoneyProps> {
    if (props.amount < 0) return Result.fail('Amount must be positive')
    return Result.ok(props)
  }

  add(other: Money): Result<Money> {
    if (this.value.currency !== other.value.currency) {
      return Result.fail('Currency mismatch')
    }
    return Money.create({
      amount: this.value.amount + other.value.amount,
      currency: this.value.currency
    })
  }

  multiply(factor: number): Result<Money> {
    return Money.create({
      amount: this.value.amount * factor,
      currency: this.value.currency
    })
  }
}
```

### When to Use

**Use Value Object:**
- Has validation rules (Email, Money)
- Should be immutable
- Equality by value, not identity
- Has business logic (`Money.add()`)

**Use Primitive:**
- No validation needed
- Simple string/number

**Use Entity:**
- Has unique identity
- Should be mutable

### Rules

**Do:**
```typescript
// Implement validate()
protected validate(props): Result<Props> {
  if (invalid) return Result.fail('error')
  return Result.ok({ ...normalized })
}

// Add business methods
add(other: Money): Result<Money>
```

**Don't:**
```typescript
// Unnecessary - parent provides
private constructor(props) { }
static create(props) { }
get value() { }

// No setters (immutable)
set value(v) { }
```

---

## Entities & Aggregates

Objects with unique identity.

### Entity vs Value Object

| Aspect | Value Object | Entity |
|--------|--------------|--------|
| Identity | By attributes | By ID (UUID) |
| Equality | By value | By ID |
| Examples | Email, Money | User, Order |

### Entity Structure

```typescript
import { Entity, Result, UUID } from '@packages/ddd-kit'
import type { Email } from './Email'

interface UserProps {
  email: Email
  name: string
  isActive: boolean
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: UUID) {
    super(props, id)
  }

  static create(props: { email: Email; name: string }, id?: UUID): Result<User> {
    if (!props.name.trim()) return Result.fail('Name required')
    return Result.ok(new User({
      email: props.email,
      name: props.name.trim(),
      isActive: true
    }, id ?? UUID.create()))
  }

  // Business methods - return NEW instance
  deactivate(): Result<User> {
    if (!this.get('isActive')) return Result.fail('Already inactive')
    return Result.ok(this.clone({ isActive: false }))
  }

  // Business queries
  canPlaceOrder(): boolean {
    return this.get('isActive')
  }
}
```

### Usage

```typescript
// Create
const user = User.create({ email, name: 'Alice' })

// Access props via get()
console.log(user.get('name'))       // "Alice"
console.log(user.get('isActive'))   // true

// Modify (returns NEW instance)
const deactivated = user.deactivate().value
console.log(user.get('isActive'))        // true (original unchanged)
console.log(deactivated.get('isActive')) // false

// Compare by ID
user1.equals(user2) // true if same _id
```

### Entity Methods

```typescript
user.get('name')           // Type-safe property access
user.getProps()            // Shallow copy of all props
user.toObject()            // Plain object (VOs unwrapped)
user.clone({ name: 'Bob' }) // Copy with overrides
user.equals(other)         // Compare by ID
```

### Aggregates

Aggregates = Entity + Domain Events + Child entities.

```typescript
import { Aggregate, Result, UUID } from '@packages/ddd-kit'

export class User extends Aggregate<UserProps> {
  static create(props: CreateUserProps): Result<User> {
    const user = new User(props, UUID.create())

    // Raise domain event
    user.addEvent(new UserCreatedEvent(user._id.value, user.get('email').value))

    return Result.ok(user)
  }
}

// After persistence
await repo.create(user)
user.markEventsForDispatch()
await DomainEvents.dispatch(user._id.value)
```

### Domain Events

```typescript
// Define event
export class UserCreatedEvent implements DomainEvent {
  type = 'UserCreated'
  constructor(
    public aggregateId: string,
    public email: string,
    public occurredAt = new Date()
  ) {}
}

// Subscribe (at app startup)
DomainEvents.subscribe('UserCreated', async (event) => {
  await sendWelcomeEmail(event.email)
})

// Dispatch (after persistence)
user.markEventsForDispatch()
await DomainEvents.dispatch(user._id.value)
```

### Rules

**Do:**
```typescript
// Factory method
static create(...): Result<User>

// Use get() for props
this.get('isActive')

// Return new instance
return Result.ok(this.clone({ name: newName }))

// Events after persistence
await repo.create(user)
user.markEventsForDispatch()
```

**Don't:**
```typescript
// Public constructor
constructor(public email: string) {}

// Manual getters (unnecessary)
get isActive() { return this._props.isActive }

// Mutation
this._props.name = newName

// Events before persistence
await DomainEvents.dispatch(user._id)
await repo.create(user)  // Can fail!
```

---

## Decision Trees

### Entity vs Aggregate

```
Does it have a unique identity?
├─ No → Value Object
└─ Yes → Does it own other entities?
         ├─ No → Entity
         └─ Yes → Does it need domain events?
                  ├─ No → Entity (root of group)
                  └─ Yes → Aggregate
```

### Result vs Option

```
Can the operation fail with an error message?
├─ Yes → Result<T>
│        └─ Multiple failure reasons? → Result<T, ErrorEnum>
└─ No → Is the value optional/nullable?
        ├─ Yes → Option<T>
        └─ No → Plain T
```

**Examples:**
- `Email.create()` → `Result<Email>` (can fail: invalid format)
- `findById()` → `Result<Option<User>>` (can fail: DB error, can be missing)
- `user.name` → `Name` (required, validated at creation)
- `user.bio` → `Option<Bio>` (optional, no error if missing)

---

## Next Steps

- [Testing](./09-testing.md)
- [Tutorial: First Feature](./03-tutorial-first-feature.md)
