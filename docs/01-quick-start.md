# Quick Start

Get your app running in 5 minutes.

## Prerequisites

- **Node.js** 20+ ([download](https://nodejs.org/))
- **pnpm** 9+ (`npm install -g pnpm`)
- **Docker** (for PostgreSQL) ([download](https://www.docker.com/))

## Setup

```bash
# Clone the repository
git clone https://github.com/axmusic/nextjs-clean-architecture-starter.git my-app
cd my-app

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL database
pnpm db

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## What's Working

Out of the box you have:

- **Authentication** - Sign up, sign in, sign out
- **Email verification** - Verification flow with emails
- **OAuth** - Google and GitHub login
- **Protected routes** - Automatic redirects
- **Dashboard layout** - Sidebar navigation
- **Stripe billing** - Checkout, webhooks, portal
- **Email service** - Transactional emails with Resend

## Verify Everything Works

```bash
# Run all quality checks
pnpm check:all
```

This runs:
- TypeScript type checking
- Biome linting
- Test suite
- Code duplication check
- Unused code detection

## Project Structure

```
apps/
├── nextjs/          # Web application
│   ├── app/         # Next.js pages
│   └── src/         # Clean Architecture layers
└── expo/            # Mobile application

packages/
├── ddd-kit/         # DDD primitives (Result, Option, Entity)
├── drizzle/         # Database schema
├── ui/              # Shared UI components
└── test/            # Test utilities
```

## Environment Variables

Essential variables in `.env`:

```env
# Database (Docker Compose provides this)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"

# Auth (generate a random secret)
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

See [Deployment Guide](./05-deployment.md) for production configuration.

## Next Steps

- **[Understand the Architecture](./02-architecture.md)** - Learn the layers and patterns
- **[Build Your First Feature](./03-tutorial-first-feature.md)** - Complete tutorial
- **[AI Workflow](./04-ai-workflow.md)** - Speed up development with Claude
