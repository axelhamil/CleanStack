# TST-005: Repository Tests

## Story

**As a** developer
**I want** integration tests for repositories
**So that** data persistence is reliable

## Acceptance Criteria

- [ ] Test DrizzleUserRepository
- [ ] Test DrizzleSubscriptionRepository
- [ ] Test with test database
- [ ] Test mappers
- [ ] Coverage > 80%

## Technical Notes

### Setup

```typescript
// packages/test/src/setup-db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5433/test';

export async function setupTestDb() {
  const client = postgres(TEST_DB_URL);
  const db = drizzle(client);

  // Run migrations or push schema
  await migrate(db, { migrationsFolder: './drizzle' });

  return { db, client };
}

export async function cleanupTestDb(client: postgres.Sql) {
  await client.end();
}
```

### Test Cases

```typescript
describe('DrizzleUserRepository', () => {
  let repo: DrizzleUserRepository;
  let db: Database;
  let client: postgres.Sql;

  beforeAll(async () => {
    const setup = await setupTestDb();
    db = setup.db;
    client = setup.client;
    repo = new DrizzleUserRepository(db);
  });

  afterAll(async () => {
    await cleanupTestDb(client);
  });

  beforeEach(async () => {
    // Clean tables
    await db.delete(users);
  });

  describe('create', () => {
    it('should persist user to database', async () => {
      const user = User.create({
        email: Email.create('test@example.com').getValue(),
        name: Name.create('John').getValue(),
      });

      const result = await repo.create(user);

      expect(result.isSuccess).toBe(true);

      const found = await db.select().from(users).where(eq(users.id, user.id.value));
      expect(found).toHaveLength(1);
      expect(found[0].email).toBe('test@example.com');
    });
  });

  describe('findById', () => {
    it('should return Some when user exists', async () => {
      const user = User.create({ email, name });
      await repo.create(user);

      const result = await repo.findById(user.id.value);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
      expect(result.getValue().unwrap().id.value).toBe(user.id.value);
    });

    it('should return None when user not found', async () => {
      const result = await repo.findById('nonexistent-id');

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const user = User.create({ email: Email.create('find@example.com').getValue(), name });
      await repo.create(user);

      const result = await repo.findByEmail('find@example.com');

      expect(result.getValue().isSome()).toBe(true);
    });
  });

  describe('update', () => {
    it('should update user in database', async () => {
      const user = User.create({ email, name: Name.create('Original').getValue() });
      await repo.create(user);

      user.updateName(Name.create('Updated').getValue());
      const result = await repo.update(user);

      expect(result.isSuccess).toBe(true);

      const found = await db.select().from(users).where(eq(users.id, user.id.value));
      expect(found[0].name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should remove user from database', async () => {
      const user = User.create({ email, name });
      await repo.create(user);

      const result = await repo.delete(user.id.value);

      expect(result.isSuccess).toBe(true);

      const found = await db.select().from(users).where(eq(users.id, user.id.value));
      expect(found).toHaveLength(0);
    });
  });
});
```

### Mapper Tests

```typescript
describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map database row to User aggregate', () => {
      const dbRow = {
        id: '123',
        email: 'test@example.com',
        name: 'John',
        emailVerified: false,
        createdAt: new Date(),
      };

      const user = UserMapper.toDomain(dbRow);

      expect(user.id.value).toBe('123');
      expect(user.email.value).toBe('test@example.com');
    });
  });

  describe('toPersistence', () => {
    it('should map User aggregate to database row', () => {
      const user = User.create({ email, name });

      const row = UserMapper.toPersistence(user);

      expect(row.email).toBe(user.email.value);
      expect(row.name).toBe(user.name.value);
    });
  });
});
```

## Definition of Done

- [ ] Tests use test database
- [ ] CRUD operations tested
- [ ] Mappers tested
- [ ] Coverage > 80%
