# TST-003: Auth Use Cases Tests

## Story

**As a** developer
**I want** comprehensive tests for auth use cases
**So that** authentication flows are reliable

## Acceptance Criteria

- [ ] Test SignUpUseCase
- [ ] Test SignInUseCase
- [ ] Test SignOutUseCase
- [ ] Test GetSessionUseCase
- [ ] Coverage > 90%

## Test Cases

### SignUpUseCase

```typescript
describe('SignUpUseCase', () => {
  let useCase: SignUpUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;
  let mockDispatcher: IEventDispatcher;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    };
    mockAuthProvider = {
      signUp: vi.fn(),
    };
    mockDispatcher = {
      dispatchAll: vi.fn(),
    };
    useCase = new SignUpUseCase(mockUserRepo, mockAuthProvider, mockDispatcher);
  });

  describe('happy path', () => {
    it('should create user when email is unique', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()));
      mockUserRepo.create.mockResolvedValue(Result.ok(mockUser));
      mockAuthProvider.signUp.mockResolvedValue(Result.ok(mockAuthResponse));

      const result = await useCase.execute({
        email: 'new@example.com',
        password: 'password123',
        name: 'John',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockUserRepo.create).toHaveBeenCalled();
    });

    it('should dispatch events after successful creation', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()));
      mockUserRepo.create.mockResolvedValue(Result.ok(mockUser));
      mockAuthProvider.signUp.mockResolvedValue(Result.ok(mockAuthResponse));

      await useCase.execute(validInput);

      expect(mockDispatcher.dispatchAll).toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('should fail when email is invalid', async () => {
      const result = await useCase.execute({
        email: 'invalid-email',
        password: 'password123',
        name: 'John',
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('email');
    });

    it('should fail when password is too short', async () => {
      const result = await useCase.execute({
        email: 'test@example.com',
        password: '123',
        name: 'John',
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe('business rules', () => {
    it('should fail when email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.some(existingUser)));

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain('already exists');
    });
  });

  describe('error handling', () => {
    it('should not dispatch events when save fails', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()));
      mockUserRepo.create.mockResolvedValue(Result.fail('DB error'));

      await useCase.execute(validInput);

      expect(mockDispatcher.dispatchAll).not.toHaveBeenCalled();
    });
  });
});
```

### SignInUseCase

```typescript
describe('SignInUseCase', () => {
  it('should return session when credentials valid', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.some(mockUser)));
    mockAuthProvider.signIn.mockResolvedValue(Result.ok(mockSession));

    const result = await useCase.execute({ email: 'test@example.com', password: 'password' });

    expect(result.isSuccess).toBe(true);
  });

  it('should fail when user not found', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.none()));

    const result = await useCase.execute({ email: 'notfound@example.com', password: 'password' });

    expect(result.isFailure).toBe(true);
  });

  it('should fail when password incorrect', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(Result.ok(Option.some(mockUser)));
    mockAuthProvider.signIn.mockResolvedValue(Result.fail('Invalid credentials'));

    const result = await useCase.execute({ email: 'test@example.com', password: 'wrong' });

    expect(result.isFailure).toBe(true);
  });
});
```

### GetSessionUseCase

```typescript
describe('GetSessionUseCase', () => {
  it('should return Some(session) when authenticated', async () => {
    mockAuthProvider.getSession.mockResolvedValue(Result.ok(Option.some(mockSession)));

    const result = await useCase.execute(mockHeaders);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().isSome()).toBe(true);
  });

  it('should return None when not authenticated', async () => {
    mockAuthProvider.getSession.mockResolvedValue(Result.ok(Option.none()));

    const result = await useCase.execute(mockHeaders);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().isNone()).toBe(true);
  });
});
```

## Definition of Done

- [ ] All tests pass
- [ ] Coverage > 90%
- [ ] All paths covered
