# TST-007: Playwright E2E Tests

## Story

**As a** developer
**I want** E2E tests with Playwright
**So that** critical user flows are validated automatically

## Acceptance Criteria

- [ ] Playwright installed and configured
- [ ] Smoke tests for critical paths
- [ ] Auth flow tested (sign up, sign in, sign out)
- [ ] Protected routes tested
- [ ] CI integration
- [ ] Visual regression optional

## Technical Notes

### Installation

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Structure

```
e2e/
├── auth.spec.ts         # Auth flows
├── dashboard.spec.ts    # Protected routes
├── billing.spec.ts      # Stripe flows
└── fixtures/
    └── auth.fixture.ts  # Reusable auth
```

### Auth Flow Tests

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'Password123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should sign in existing user', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should sign out', async ({ page }) => {
    // First sign in
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Then sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Log out');

    await expect(page).toHaveURL('/');
  });

  test('should redirect unauthenticated to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/login');
  });
});
```

### Auth Fixture (Reusable)

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await use(page);
  },
});

export { expect } from '@playwright/test';
```

### Dashboard Tests

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from './fixtures/auth.fixture';

test.describe('Dashboard', () => {
  test('should display user info', async ({ authenticatedPage: page }) => {
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
  });

  test('should navigate to settings', async ({ authenticatedPage: page }) => {
    await page.click('text=Settings');

    await expect(page).toHaveURL('/settings');
  });
});
```

### NPM Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### CI Integration

```yaml
# Add to .github/workflows/ci.yml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Test Data Strategy

```typescript
// e2e/fixtures/test-data.ts
export const testUsers = {
  standard: {
    email: 'e2e-standard@test.local',
    password: 'TestPassword123!',
    name: 'E2E Standard User',
  },
  premium: {
    email: 'e2e-premium@test.local',
    password: 'TestPassword123!',
    name: 'E2E Premium User',
  },
};

// Seed in CI before tests
// pnpm db:seed:e2e
```

## Definition of Done

- [ ] Playwright configured
- [ ] Auth flow tests pass
- [ ] Dashboard tests pass
- [ ] CI runs E2E tests
- [ ] Report generated
