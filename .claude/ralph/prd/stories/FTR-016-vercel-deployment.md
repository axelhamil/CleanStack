# FTR-016: Vercel Deployment

## Story

**As a** developer
**I want** automated Vercel deployment
**So that** the app deploys automatically on every push

## Acceptance Criteria

- [ ] Vercel project configured
- [ ] Auto-deploy on push to main
- [ ] Preview deployments on PRs
- [ ] Environment variables configured
- [ ] Build optimization
- [ ] Domain configured (optional)

## Technical Notes

### Vercel Setup

```bash
# Install Vercel CLI
pnpm add -g vercel

# Link project
vercel link

# Deploy (first time)
vercel
```

### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "outputDirectory": "apps/nextjs/.next"
}
```

### Environment Variables

Configure in Vercel Dashboard → Settings → Environment Variables:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://your-domain.vercel.app

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PUBLISHABLE_KEY=...

# Email
RESEND_API_KEY=...
EMAIL_FROM=noreply@your-domain.com

# Optional: Sentry
SENTRY_DSN=...
```

### Monorepo Configuration

```json
// vercel.json
{
  "buildCommand": "cd ../.. && pnpm build --filter=nextjs",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

Or use Root Directory in Vercel settings: `apps/nextjs`

### Preview Deployments

Automatic on PRs. Configure in Vercel:
- Enable "Preview Deployments"
- Set preview environment variables
- Use Stripe test mode keys

### Build Optimization

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Optimize for Vercel
  output: 'standalone',

  // Reduce cold starts
  experimental: {
    serverMinification: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default config;
```

### Database Connection (Neon)

```env
# Use pooled connection for serverless
DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/db?sslmode=require&pgbouncer=true

# Direct connection for migrations
DATABASE_URL_DIRECT=postgresql://user:pass@ep-xxx.region.neon.tech/db?sslmode=require
```

```typescript
// drizzle.config.ts
export default {
  dbCredentials: {
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL!,
  },
};
```

### GitHub Integration

1. Connect GitHub repo to Vercel
2. Enable "Automatically expose System Environment Variables"
3. Configure Production/Preview/Development branches

### Post-Deploy Hooks

```json
// vercel.json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Deployment Checklist

```markdown
## Pre-Deploy
- [ ] All tests pass
- [ ] Build succeeds locally
- [ ] Environment variables set

## Deploy
- [ ] Connect repo to Vercel
- [ ] Configure root directory
- [ ] Set environment variables
- [ ] Enable auto-deploy

## Post-Deploy
- [ ] Verify production URL
- [ ] Test auth flow
- [ ] Test Stripe webhooks
- [ ] Check error tracking
```

### Stripe Webhook for Vercel

```bash
# Get webhook endpoint
https://your-domain.vercel.app/api/stripe/webhook

# Update in Stripe Dashboard:
# 1. Go to Developers → Webhooks
# 2. Add endpoint for production URL
# 3. Select events
# 4. Copy webhook secret to Vercel env
```

## Definition of Done

- [ ] Vercel project linked
- [ ] Auto-deploy working
- [ ] Preview deploys working
- [ ] All env vars configured
- [ ] Production URL accessible
- [ ] Auth + Stripe functional
