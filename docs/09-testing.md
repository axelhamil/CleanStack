# Testing

Clean Architecture makes testing easy.

## Testing Pyramid

```
       /\        E2E (10%) - Slow, via API
      /  \
     /----\      Integration (30%) - Use Cases + DB
    /      \
   /--------\    Unit (60%) - Domain, fast
```

## Unit Tests (Domain)

No mocks needed - pure business logic.

```typescript
// domain/product/__tests__/ProductName.test.ts
describe('ProductName', () => {
  it('creates valid name', () => {
    const result = ProductName.create({ value: 'iPhone' })
    expect(result.isSuccess).toBe(true)
  })

  it('rejects empty name', () => {
    const result = ProductName.create({ value: '' })
    expect(result.isFailure).toBe(true)
  })

  it('trims whitespace', () => {
    const result = ProductName.create({ value: '  iPhone  ' })
    expect(result.value.value.value).toBe('iPhone')
  })
})
```

## Integration Tests (Use Cases)

Mock repositories.

```typescript
// application/use-cases/__tests__/CreateUserUseCase.test.ts
describe('CreateUserUseCase', () => {
  const mockRepo = {
    create: vi.fn(),
    findByEmail: vi.fn()
  }

  it('creates user successfully', async () => {
    mockRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()))
    mockRepo.create.mockResolvedValue(Result.ok(mockUser))

    const useCase = new CreateUserUseCase(mockRepo)
    const result = await useCase.execute({ email: 'test@example.com', name: 'Alice' })

    expect(result.isSuccess).toBe(true)
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('fails if email exists', async () => {
    mockRepo.findByEmail.mockResolvedValue(Result.ok(Option.some(existingUser)))

    const result = await useCase.execute({ email: 'test@example.com', name: 'Alice' })

    expect(result.isFailure).toBe(true)
    expect(mockRepo.create).not.toHaveBeenCalled()
  })
})
```

## E2E Tests (Routes)

Real database.

```typescript
// adapters/in/api/__tests__/users.test.ts
describe('POST /api/users', () => {
  beforeEach(async () => {
    await db.delete(users)
  })

  it('creates user and returns 201', async () => {
    const response = await POST(new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', name: 'Alice' })
    }))

    expect(response.status).toBe(201)
    const rows = await db.select().from(users)
    expect(rows).toHaveLength(1)
  })

  it('returns 400 for invalid email', async () => {
    const response = await POST(new Request('http://localhost/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid', name: 'Alice' })
    }))

    expect(response.status).toBe(400)
  })
})
```

## Commands

```bash
pnpm test              # All tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

## Test Structure

```typescript
describe("CreateSubscriptionUseCase", () => {
  let sut: CreateSubscriptionUseCase;
  let mockRepo: ISubscriptionRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput = {
    userId: "user-123",
    planId: "plan-pro",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
    };
    mockEventDispatcher = {
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
    };
    sut = new CreateSubscriptionUseCase(mockRepo, mockEventDispatcher);
  });

  describe("happy path", () => {
    it("should create subscription when input is valid", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(Result.ok(mockEntity));

      const result = await sut.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should not dispatch events when save fails", async () => {
      vi.mocked(mockRepo.create).mockResolvedValue(
        Result.fail("Database error")
      );

      await sut.execute(validInput);

      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });
  });
});
```

## Test Categories

| Category | Purpose | Example |
|----------|---------|---------|
| Happy Path | Success scenarios | `should create user when email is unique` |
| Validation | Invalid input | `should fail when email format is invalid` |
| Business Rules | Domain logic | `should fail when user already subscribed` |
| Error Handling | Failures | `should fail when repository returns error` |
| Events | Event emission | `should dispatch UserCreated event` |

## Naming Convention

BDD pattern: `"should [action] when [condition]"`

- `should create user when email is unique`
- `should fail when password is too short`
- `should emit UserCreated event on success`

## Best Practices

### Do

```typescript
// Test behavior
it('rejects invalid email', () => {
  expect(Email.create('invalid').isFailure).toBe(true)
})

// AAA pattern
it('creates user', async () => {
  // Arrange
  const mockRepo = createMockRepo()

  // Act
  const result = await useCase.execute(input)

  // Assert
  expect(result.isSuccess).toBe(true)
})

// Descriptive names
it('should reject email longer than 255 characters', () => {})
```

### Don't

```typescript
// Test implementation
expect(spy).toHaveBeenCalled()

// Dependent tests
let user: User
it('creates user', () => { user = ... })
it('updates user', () => { user.update(...) })  // Depends on previous!
```

## Rules

1. **One file per Use Case** - Keep tests organized
2. **Mock at repository level** - Not internal implementation
3. **Test Result/Option states** - Verify success and failure paths
4. **Name as behaviors** - "should X when Y"
5. **No test interdependence** - Each test is isolated

---

## Next Steps

- [AI Workflow](./04-ai-workflow.md) - Generate tests with `/gen-tests`
- [Core Concepts](./08-core-concepts.md) - Result and Option patterns
