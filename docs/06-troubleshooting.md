# Troubleshooting

Common issues and their solutions.

## Development Issues

### "Cannot find module" After Code Generation

TypeScript server cache is stale.

**Solution:**
1. VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server"
2. Or close and reopen the file

### "DI Symbol not found"

The DI container doesn't have the binding.

**Solution:**
1. Check `common/di/symbols.ts` has the symbol
2. Check the module registers the binding
3. Verify module is imported in `common/di/container.ts`

```typescript
// common/di/symbols.ts
export const DI_SYMBOLS = {
  // Add your symbol
  INoteRepository: Symbol.for("INoteRepository"),
};

// common/di/modules/note.module.ts
m.bind(DI_SYMBOLS.INoteRepository).toClass(DrizzleNoteRepository);
```

### Database Connection Failed

PostgreSQL isn't running or connection string is wrong.

**Solution:**
1. Check Docker is running: `docker ps`
2. Start database: `pnpm db`
3. Verify `.env` has correct `DATABASE_URL`

```bash
# Test connection
docker exec -it postgres psql -U postgres -c "SELECT 1"
```

### "Port 3000 already in use"

Another process is using the port.

**Solution:**
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm dev
```

## Testing Issues

### Tests Fail with Mock Errors

Mock setup doesn't match the interface.

**Solution:**
1. Check mock implements all interface methods
2. Verify return types match (Result, Option)
3. Use `vi.fn()` for all methods

```typescript
// Correct mock
const mockRepo: INoteRepository = {
  create: vi.fn().mockResolvedValue(Result.ok(mockNote)),
  findById: vi.fn().mockResolvedValue(Result.ok(Option.some(mockNote))),
  update: vi.fn().mockResolvedValue(Result.ok(mockNote)),
  delete: vi.fn().mockResolvedValue(Result.ok(noteId)),
  // ... all other methods
};
```

### "Test Timeout"

Async operation isn't resolving.

**Solution:**
1. Check all mocks return Promises
2. Verify `await` is used correctly
3. Increase timeout if needed

```typescript
it('should work', async () => {
  // Ensure mock returns a Promise
  mockRepo.create.mockResolvedValue(Result.ok(note));

  const result = await useCase.execute(input);
  // ...
}, 10000); // Increase timeout
```

### Tests Pass Locally but Fail in CI

Environment differences.

**Solution:**
1. Check CI environment variables
2. Verify Node version matches
3. Clear caches: `pnpm clean && pnpm install`

## Build Issues

### TypeScript Errors

Type mismatches or missing types.

**Solution:**
```bash
# Run type check to see all errors
pnpm type-check

# Common fixes:
# 1. Add missing types
# 2. Fix import paths
# 3. Update tsconfig paths
```

### "Module not found" in Build

Import path is wrong or module isn't exported.

**Solution:**
1. Check the import path is correct
2. Verify the file exports what you're importing
3. Check `tsconfig.json` path aliases

### Build Fails on Vercel

Different environment or missing variables.

**Solution:**
1. Check Vercel build logs
2. Verify all env vars are set
3. Test build locally: `pnpm build`

```bash
# Simulate Vercel build
NODE_ENV=production pnpm build
```

## Auth Issues

### "Session not found"

Session cookie isn't being set or read.

**Solution:**
1. Check `BETTER_AUTH_URL` matches your domain
2. Verify cookies aren't blocked
3. Check HTTPS in production

### OAuth Redirect Fails

Callback URL mismatch.

**Solution:**
1. Add correct redirect URI in OAuth provider:
   - Google: Cloud Console > Credentials
   - GitHub: Developer Settings > OAuth Apps
2. URI format: `https://your-domain.com/api/auth/callback/[provider]`

### "Invalid credentials"

Password verification failing.

**Solution:**
1. Check password meets requirements (min 8 chars)
2. Verify email exists in database
3. Check for extra whitespace in input

## Database Issues

### "Relation does not exist"

Schema isn't pushed to database.

**Solution:**
```bash
# Push schema
pnpm db:push

# Or generate and run migration
pnpm db:generate
pnpm db:migrate
```

### "Connection refused"

Database server isn't reachable.

**Solution:**
1. Check database is running: `pnpm db`
2. Verify connection string in `.env`
3. Check firewall/network settings

### "Too many connections"

Connection pool exhausted.

**Solution:**
1. Use connection pooling (Neon, Supabase pooler)
2. Close connections properly
3. Reduce pool size in development

## Stripe Issues

### Webhook Not Receiving Events

Endpoint not configured or secret mismatch.

**Solution:**
1. Verify webhook URL in Stripe Dashboard
2. Check `STRIPE_WEBHOOK_SECRET` matches
3. For local testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### "Invalid signature"

Webhook secret is wrong.

**Solution:**
1. Get correct secret from Stripe Dashboard > Webhooks
2. Update `STRIPE_WEBHOOK_SECRET` in `.env`

### Checkout Not Redirecting

Session creation failing.

**Solution:**
1. Check Stripe API key is correct
2. Verify price IDs exist
3. Check success/cancel URLs are valid

## Commit Issues

### Commit Rejected by Hook

Pre-commit checks failed.

**Solution:**
```bash
# Check what failed
pnpm check:all

# Fix lint issues
pnpm fix

# Fix type errors
pnpm type-check
```

### Commitlint Error

Commit message doesn't follow convention.

**Solution:**
Format: `type(scope): message`

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

```bash
# Correct
git commit -m "feat(auth): add password reset"

# Wrong
git commit -m "Added password reset"  # Missing type
git commit -m "feat: Add Feature"     # Uppercase
```

## Performance Issues

### Slow Development Server

Too many files being watched.

**Solution:**
1. Check `.gitignore` excludes `node_modules`, `.next`
2. Increase file watcher limit (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Slow Tests

Tests running sequentially or without optimization.

**Solution:**
```bash
# Run tests in parallel
pnpm test -- --pool=threads

# Run specific test
pnpm test -- path/to/test.ts
```

## Still Stuck?

1. **Search issues:** [GitHub Issues](https://github.com/axmusic/nextjs-clean-architecture-starter/issues)
2. **Ask in discussions:** [GitHub Discussions](https://github.com/axmusic/nextjs-clean-architecture-starter/discussions)
3. **Check CLAUDE.md:** The AI guide has detailed patterns
