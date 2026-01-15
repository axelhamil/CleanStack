# FAQ

Frequently asked questions about the boilerplate.

## General

### Why Clean Architecture?

**Short answer:** Testability, maintainability, and AI compatibility.

**Long answer:**
- **Testability**: Mock at boundaries, test business logic in isolation
- **Maintainability**: Clear structure, each layer has one responsibility
- **AI compatibility**: Consistent patterns let AI generate code faster
- **Framework independence**: Swap Next.js for something else without rewriting business logic

### Can I use this without AI?

Absolutely. The architecture works great with manual development. AI just accelerates the process.

The patterns (Result, Option, Use Cases) improve code quality regardless of how you write it.

### Is this production-ready?

Yes. The boilerplate includes:
- Complete auth with OAuth
- Stripe billing integration
- Email service with templates
- Error monitoring (Sentry)
- CI/CD pipeline
- 90%+ test coverage on core logic

### Why a monorepo?

- **Code sharing**: `ddd-kit`, UI components, types used across apps
- **Consistent tooling**: One config for lint, test, build
- **Atomic changes**: Update shared code and consumers in one commit

## Architecture

### Why Result<T> instead of throwing exceptions?

```typescript
// With exceptions (hidden control flow)
try {
  const user = await findUser(id);
  return user;
} catch (e) {
  // What errors? Check every function call...
}

// With Result (explicit control flow)
const result = await findUser(id);
if (result.isFailure) {
  return handleError(result.getError()); // Error type is known
}
return result.getValue();
```

Benefits:
- TypeScript knows all possible states
- No hidden throws to track
- Composable: `Result.combine([r1, r2, r3])`

### Why Option<T> instead of null?

```typescript
// With null (easy to forget)
const user = await repo.findById(id);
if (user !== null) { // Easy to forget this check
  doSomething(user);
}

// With Option (forced handling)
match(userOption, {
  Some: (user) => doSomething(user),
  None: () => handleNotFound(),
});
```

Benefits:
- Can't accidentally use undefined value
- Pattern matching makes handling explicit
- Composable: `option.map(fn).flatMap(fn)`

### Why Zod in Value Objects?

Single source of truth for validation:
- Domain validation (Email, Password)
- DTO validation (API input)
- Form validation (React Hook Form)

```typescript
// Value Object with Zod
const emailSchema = z.string().email();

export class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const parsed = emailSchema.safeParse(value);
    if (!parsed.success) return Result.fail(parsed.error.message);
    return Result.ok(parsed.data);
  }
}
```

### Why not tRPC?

Clean Architecture prefers explicit layers over RPC magic:
- Use Cases define the API contract
- Controllers handle HTTP specifics
- Easier to test and understand

That said, you can add tRPC if you prefer. The architecture is flexible.

### Why Drizzle instead of Prisma?

- **Performance**: SQL-like syntax, less abstraction
- **Type safety**: Inferred types from schema
- **Flexibility**: Easy raw SQL when needed

You can use Prisma by implementing the repository interfaces.

### Can I use a different ORM?

Yes. Repositories are abstracted behind interfaces:

```typescript
interface IUserRepository {
  create(user: User): Promise<Result<User>>;
  findById(id: UserId): Promise<Result<Option<User>>>;
  // ...
}

// Implement with any ORM
class PrismaUserRepository implements IUserRepository { ... }
class TypeORMUserRepository implements IUserRepository { ... }
```

## AI Development

### Do I need Claude specifically?

Skills are designed for Claude, but the architecture works with any AI:
- GPT-4 can understand the patterns from CLAUDE.md
- Copilot benefits from consistent structure
- Any AI can generate code following the examples

### The AI isn't suggesting skills automatically?

Check:
1. `CLAUDE.md` is in project root
2. You're using Claude Code (not the web interface)
3. Hooks are enabled in settings

Try explicit skill calls: `/eventstorming "description"`

### Can I create my own skills?

Yes. Skills are markdown files in `.claude/skills/`:

```markdown
# my-skill.md

## Trigger
When user asks to "do my thing"

## Template
Based on the request, generate...
```

### Why EventStorming first?

EventStorming identifies:
- **Events**: What happened (NoteCreated)
- **Commands**: What triggered it (CreateNote)
- **Aggregates**: Who owns it (Note)
- **Value Objects**: What data (NoteTitle)

This discovery prevents building the wrong thing.

## Technical Choices

### Why BetterAuth instead of NextAuth?

- Better TypeScript support
- Simpler API
- Built-in email verification
- Easier to extend

### Why Turborepo?

- Fast builds with caching
- Task orchestration (build deps first)
- Remote caching for CI
- Simpler config than Nx

### Why Vitest instead of Jest?

- Faster execution
- ESM support out of the box
- Same API as Jest
- Better TypeScript integration

### Why Biome instead of ESLint + Prettier?

- One tool instead of two
- Much faster (Rust-based)
- Simpler configuration
- Same quality rules

## Customization

### How do I add a new domain?

1. Create folder: `src/domain/[name]/`
2. Add aggregate: `[name].aggregate.ts`
3. Add value objects: `[name]-id.vo.ts`, etc.
4. Add events: `events/[name]-created.event.ts`

Or use: `/gen-domain [Name]`

### How do I add a new use case?

1. Create use case: `src/application/use-cases/[domain]/[name].use-case.ts`
2. Create DTOs: `src/application/dto/[domain]/[name].dto.ts`
3. Add DI binding in module

Or use: `/gen-usecase [Name]`

### How do I add a new API route?

1. Create controller: `src/adapters/controllers/[name].controller.ts`
2. Create route: `app/api/[path]/route.ts`
3. Call controller from route

### How do I add a new page?

1. Create page: `app/(group)/[path]/page.tsx`
2. Add components: `app/(group)/[path]/_components/`
3. Use guards if needed: `await requireAuth()`

## Contributing

### How do I report a bug?

Use the [bug report template](https://github.com/axmusic/nextjs-clean-architecture-starter/issues/new?template=bug_report.md).

Include:
- Steps to reproduce
- Expected vs actual behavior
- Environment details

### How do I suggest a feature?

Use the [feature request template](https://github.com/axmusic/nextjs-clean-architecture-starter/issues/new?template=feature_request.md).

### Can I contribute?

Yes! See [Contributing Guide](https://github.com/axmusic/nextjs-clean-architecture-starter/blob/main/CONTRIBUTING.md).
