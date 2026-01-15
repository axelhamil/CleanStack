# DDD-009: BaseRepository Tests

## Story

**As a** ddd-kit maintainer
**I want** tests for BaseRepository interface
**So that** repository implementations are consistent

## Acceptance Criteria

- [ ] Test interface contract documentation
- [ ] Test mock implementation for all methods
- [ ] Test `create()` returns Result<T>
- [ ] Test `update()` returns Result<T>
- [ ] Test `delete()` returns Result<id>
- [ ] Test `findById()` returns Result<Option<T>>
- [ ] Test `findAll()` with pagination
- [ ] Test `findMany()` with filters and pagination
- [ ] Test `findBy()` returns Result<Option<T>>
- [ ] Test `exists()` returns Result<boolean>
- [ ] Test `count()` returns Result<number>
- [ ] Coverage > 95%

## Test Cases

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

class MockUserRepository implements BaseRepository<User> {
  private users: User[] = [];

  async create(entity: User): Promise<Result<User>> {
    this.users.push(entity);
    return Result.ok(entity);
  }

  async update(entity: User): Promise<Result<User>> {
    const index = this.users.findIndex(u => u.id === entity.id);
    if (index === -1) return Result.fail('Not found');
    this.users[index] = entity;
    return Result.ok(entity);
  }

  async delete(id: string): Promise<Result<string>> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return Result.fail('Not found');
    this.users.splice(index, 1);
    return Result.ok(id);
  }

  async findById(id: string): Promise<Result<Option<User>>> {
    const user = this.users.find(u => u.id === id);
    return Result.ok(Option.fromNullable(user));
  }

  async findAll(pagination?: PaginationParams): Promise<Result<PaginatedResult<User>>> {
    const params = pagination ?? DEFAULT_PAGINATION;
    const start = (params.page - 1) * params.limit;
    const data = this.users.slice(start, start + params.limit);
    return Result.ok(createPaginatedResult(data, params, this.users.length));
  }

  async findMany(props: Partial<User>, pagination?: PaginationParams): Promise<Result<PaginatedResult<User>>> {
    const filtered = this.users.filter(u =>
      Object.entries(props).every(([k, v]) => u[k] === v)
    );
    const params = pagination ?? DEFAULT_PAGINATION;
    const start = (params.page - 1) * params.limit;
    const data = filtered.slice(start, start + params.limit);
    return Result.ok(createPaginatedResult(data, params, filtered.length));
  }

  async findBy(props: Partial<User>): Promise<Result<Option<User>>> {
    const user = this.users.find(u =>
      Object.entries(props).every(([k, v]) => u[k] === v)
    );
    return Result.ok(Option.fromNullable(user));
  }

  async exists(id: string): Promise<Result<boolean>> {
    return Result.ok(this.users.some(u => u.id === id));
  }

  async count(): Promise<Result<number>> {
    return Result.ok(this.users.length);
  }
}

describe('BaseRepository', () => {
  let repo: MockUserRepository;

  beforeEach(() => {
    repo = new MockUserRepository();
  });

  describe('create', () => {
    it('should create and return entity', async () => {
      const user = { id: '1', name: 'John', email: 'john@test.com' };
      const result = await repo.create(user);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should return Some when found', async () => {
      const user = { id: '1', name: 'John', email: 'john@test.com' };
      await repo.create(user);

      const result = await repo.findById('1');
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
    });

    it('should return None when not found', async () => {
      const result = await repo.findById('nonexistent');
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe('findAll with pagination', () => {
    it('should return paginated results', async () => {
      for (let i = 0; i < 25; i++) {
        await repo.create({ id: `${i}`, name: `User ${i}`, email: `user${i}@test.com` });
      }

      const result = await repo.findAll({ page: 1, limit: 10 });
      expect(result.getValue().data).toHaveLength(10);
      expect(result.getValue().pagination.total).toBe(25);
      expect(result.getValue().pagination.totalPages).toBe(3);
    });
  });

  describe('findMany with filters', () => {
    it('should filter and paginate', async () => {
      await repo.create({ id: '1', name: 'John', email: 'john@test.com' });
      await repo.create({ id: '2', name: 'John', email: 'john2@test.com' });
      await repo.create({ id: '3', name: 'Jane', email: 'jane@test.com' });

      const result = await repo.findMany({ name: 'John' });
      expect(result.getValue().data).toHaveLength(2);
    });
  });

  describe('exists', () => {
    it('should return true when exists', async () => {
      await repo.create({ id: '1', name: 'John', email: 'john@test.com' });
      const result = await repo.exists('1');
      expect(result.getValue()).toBe(true);
    });

    it('should return false when not exists', async () => {
      const result = await repo.exists('nonexistent');
      expect(result.getValue()).toBe(false);
    });
  });
});
```

## Definition of Done

- [ ] All test cases pass
- [ ] Interface documented
- [ ] Coverage > 95%
