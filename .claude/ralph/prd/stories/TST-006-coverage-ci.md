# TST-006: Coverage in CI

## Story

**As a** maintainer
**I want** coverage enforcement in CI
**So that** coverage doesn't regress

## Acceptance Criteria

- [ ] Coverage threshold: 90%
- [ ] CI fails if below threshold
- [ ] Coverage report in PR comments
- [ ] Coverage badge in README

## Technical Notes

### Vitest Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/types/**',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
});
```

### Package Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### CI Workflow

```yaml
# .github/workflows/ci.yml
test:
  runs-on: ubuntu-latest
  services:
    postgres:
      image: postgres:15
      env:
        POSTGRES_USER: test
        POSTGRES_PASSWORD: test
        POSTGRES_DB: test
      ports:
        - 5433:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 10s
        --health-timeout 5s
        --health-retries 5

  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'pnpm'

    - run: pnpm install
    - run: pnpm test:coverage
      env:
        TEST_DATABASE_URL: postgresql://test:test@localhost:5433/test

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        fail_ci_if_error: true

    - name: Coverage Report
      uses: davelosert/vitest-coverage-report-action@v2
      if: github.event_name == 'pull_request'
```

### Codecov Config

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 90%
        threshold: 1%
    patch:
      default:
        target: 90%
        threshold: 1%

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
```

### README Badge

```markdown
[![codecov](https://codecov.io/gh/[org]/[repo]/branch/main/graph/badge.svg)](https://codecov.io/gh/[org]/[repo])
```

## Definition of Done

- [ ] Coverage threshold enforced
- [ ] CI fails below 90%
- [ ] Codecov integration working
- [ ] Badge displays correctly
