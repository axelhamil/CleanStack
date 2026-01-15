# EVT-006: Event System Tests

## Story

**As a** developer
**I want** comprehensive tests for the event system
**So that** event dispatch is reliable

## Acceptance Criteria

- [ ] Test event creation with correct payload
- [ ] Test dispatcher subscribe/dispatch
- [ ] Test aggregate event emission
- [ ] Test UseCase dispatches after save
- [ ] Test handler execution
- [ ] Test error isolation between handlers
- [ ] Coverage > 90%

## Test Cases

### Event Creation

```typescript
describe('UserCreatedEvent', () => {
  it('should create event with correct payload', () => {
    const user = User.create({
      email: Email.create('test@example.com').getValue(),
      name: Name.create('John').getValue(),
    });

    const event = new UserCreatedEvent(user);

    expect(event.eventType).toBe('user.created');
    expect(event.aggregateId).toBe(user.id.value);
    expect(event.payload.email).toBe('test@example.com');
    expect(event.dateOccurred).toBeInstanceOf(Date);
  });
});
```

### Dispatcher

```typescript
describe('InMemoryEventDispatcher', () => {
  let dispatcher: InMemoryEventDispatcher;

  beforeEach(() => {
    dispatcher = new InMemoryEventDispatcher();
  });

  it('should dispatch to subscribed handler', async () => {
    const handler = vi.fn();
    dispatcher.subscribe('user.created', handler);

    const event = new UserCreatedEvent(mockUser);
    await dispatcher.dispatch(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it('should continue if handler throws', async () => {
    const failingHandler = vi.fn().mockRejectedValue(new Error('fail'));
    const successHandler = vi.fn();

    dispatcher.subscribe('user.created', failingHandler);
    dispatcher.subscribe('user.created', successHandler);

    await dispatcher.dispatch(new UserCreatedEvent(mockUser));

    expect(successHandler).toHaveBeenCalled();
  });
});
```

### UseCase Integration

```typescript
describe('SignUpUseCase events', () => {
  it('should dispatch UserCreatedEvent after successful save', async () => {
    const dispatcher = { dispatch: vi.fn(), dispatchAll: vi.fn() };
    const useCase = new SignUpUseCase(mockRepo, mockAuth, dispatcher);

    mockRepo.create.mockResolvedValue(Result.ok(mockUser));
    mockAuth.signUp.mockResolvedValue(Result.ok(mockResponse));

    await useCase.execute({ email: 'test@example.com', password: 'password123', name: 'John' });

    expect(dispatcher.dispatchAll).toHaveBeenCalled();
    const events = dispatcher.dispatchAll.mock.calls[0][0];
    expect(events[0]).toBeInstanceOf(UserCreatedEvent);
  });

  it('should NOT dispatch events if save fails', async () => {
    const dispatcher = { dispatch: vi.fn(), dispatchAll: vi.fn() };
    const useCase = new SignUpUseCase(mockRepo, mockAuth, dispatcher);

    mockRepo.create.mockResolvedValue(Result.fail('DB error'));

    await useCase.execute({ email: 'test@example.com', password: 'password123', name: 'John' });

    expect(dispatcher.dispatchAll).not.toHaveBeenCalled();
  });
});
```

## Definition of Done

- [ ] All test cases pass
- [ ] Coverage > 90%
- [ ] Integration tests verify E2E flow
