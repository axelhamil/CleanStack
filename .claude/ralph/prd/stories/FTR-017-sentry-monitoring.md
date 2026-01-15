# FTR-017: Sentry Error Tracking (Optional)

## Story

**As a** developer
**I want** error tracking with Sentry
**So that** I can monitor and fix production issues

## Acceptance Criteria

- [ ] Sentry SDK installed
- [ ] Client-side errors captured
- [ ] Server-side errors captured
- [ ] Source maps uploaded
- [ ] Environment tagging
- [ ] Release tracking

## Technical Notes

### Installation

```bash
pnpm add @sentry/nextjs
pnpm exec @sentry/wizard@latest -i nextjs
```

### Configuration Files

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: 1.0,

  // Session replay (optional)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
```

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
});
```

### Next.js Config

```typescript
// next.config.ts
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // ... existing config
};

export default withSentryConfig(nextConfig, {
  // Upload source maps
  org: 'your-org',
  project: 'your-project',

  // Only upload in CI
  silent: !process.env.CI,

  // Hide source maps from client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger
  disableLogger: true,
});
```

### Error Boundary

```typescript
// app/global-error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

### Custom Error Capture

```typescript
// In use cases or controllers
import * as Sentry from '@sentry/nextjs';

export class SignInUseCase {
  async execute(input: Input): Promise<Result<Output>> {
    try {
      // ... logic
    } catch (error) {
      Sentry.captureException(error, {
        tags: { useCase: 'SignIn' },
        extra: { email: input.email },
      });
      return Result.fail('An unexpected error occurred');
    }
  }
}
```

### User Context

```typescript
// Set user context on sign in
import * as Sentry from '@sentry/nextjs';

export function setUserContext(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}

// Clear on sign out
export function clearUserContext() {
  Sentry.setUser(null);
}
```

### Environment Variables

```env
# Client-side (public)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Server-side
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=sntrys_xxx
```

### Release Tracking

```yaml
# .github/workflows/release.yml
- name: Create Sentry Release
  uses: getsentry/action-release@v1
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_ORG: your-org
    SENTRY_PROJECT: your-project
  with:
    environment: production
    version: ${{ github.sha }}
```

### Filtering Noise

```typescript
// sentry.client.config.ts
Sentry.init({
  // ... other config

  beforeSend(event) {
    // Filter out specific errors
    if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
      return null;
    }
    return event;
  },

  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
});
```

## Definition of Done

- [ ] Sentry SDK installed
- [ ] Client errors captured
- [ ] Server errors captured
- [ ] Source maps working
- [ ] Release tracking enabled
- [ ] User context set
