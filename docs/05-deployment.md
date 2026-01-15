# Deployment

Deploy your application to production.

## Vercel (Recommended)

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel auto-detects Next.js

3. **Set Environment Variables**
   - Add all required variables (see below)
   - Click Deploy

### Environment Variables

#### Required

```env
# Database (use pooled connection)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Auth
BETTER_AUTH_SECRET="generate-a-random-32-char-string"
BETTER_AUTH_URL="https://your-domain.vercel.app"
```

#### OAuth (Optional)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

#### Stripe (If using billing)

```env
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Product/Price IDs
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."
```

#### Email

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"
```

#### Monitoring

```env
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="sntrys_..."
```

### Vercel Configuration

The `vercel.json` is already configured:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "apps/nextjs/.next",
  "framework": "nextjs"
}
```

## Database Options

### Neon (Serverless PostgreSQL)

**Best for:** Vercel deployments, auto-scaling, free tier

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the pooled connection string
4. Set as `DATABASE_URL`

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

### Supabase

**Best for:** Additional features (storage, realtime), free tier

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings > Database
3. Copy the connection string (use pooler for serverless)

```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

### Railway

**Best for:** Simple setup, predictable pricing

1. Create project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy connection string

### Self-Hosted

For Docker/VPS deployments:

```yaml
# docker-compose.prod.yml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select a project
3. Go to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://your-domain.com/api/auth/callback/google`
6. Copy Client ID and Secret

### GitHub OAuth

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create New OAuth App
3. Set Authorization callback URL:
   - `https://your-domain.com/api/auth/callback/github`
4. Copy Client ID and Secret

## Stripe Setup

### Production Mode

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to Live mode
3. Get API keys from Developers > API keys
4. Create products and prices
5. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`

### Webhook Secret

1. Go to Developers > Webhooks
2. Add endpoint
3. Copy signing secret as `STRIPE_WEBHOOK_SECRET`

## Email Setup (Resend)

1. Create account at [resend.com](https://resend.com)
2. Add and verify your domain
3. Get API key
4. Set `RESEND_API_KEY` and `EMAIL_FROM`

## Monitoring (Sentry)

1. Create project at [sentry.io](https://sentry.io)
2. Select Next.js
3. Copy DSN
4. Get auth token from Settings > Auth Tokens

## Pre-Deployment Checklist

```bash
# Run all checks locally
pnpm check:all

# Verify build works
pnpm build

# Check for secrets in code
git log -p | grep -i "secret\|password\|key" # Should be empty
```

### Security

- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS only (Vercel handles this)
- [ ] CORS configured correctly

### Database

- [ ] Using pooled connection string
- [ ] Migrations applied: `pnpm db:push`
- [ ] Backup strategy in place

### Auth

- [ ] `BETTER_AUTH_URL` matches production domain
- [ ] OAuth redirect URIs updated
- [ ] Session secrets are unique per environment

### Monitoring

- [ ] Sentry configured
- [ ] Error alerts set up
- [ ] Log retention configured

## Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs

# Common fixes:
# 1. Missing env vars
# 2. Type errors - run pnpm type-check locally
# 3. Missing dependencies
```

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Common fixes:
# 1. Use pooled connection for serverless
# 2. Check SSL mode
# 3. Verify IP allowlist
```

### Auth Not Working

1. Check `BETTER_AUTH_URL` matches deployed URL
2. Verify OAuth redirect URIs
3. Check browser console for errors

## Next Steps

- **[Troubleshooting](./06-troubleshooting.md)** - Common issues
- **[FAQ](./07-faq.md)** - Frequently asked questions
