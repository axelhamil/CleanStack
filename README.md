# CleanStack

**Production-ready Next.js starter with Clean Architecture and Domain-Driven Design**

A modern monorepo template for building scalable enterprise applications. Implements Clean Architecture, DDD patterns, and AI-friendly development practices.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-blue?logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## TL;DR - Quick Start

```bash
pnpm install && cp .env.example .env && pnpm db && pnpm db:push && pnpm dev
```

That's it. Visit [localhost:3000](http://localhost:3000)

**First time?** → Read [Getting Started](#getting-started) for detailed setup.

---

## What's Inside

### Architecture Patterns

**Clean Architecture** with strict layer separation (Domain → Application → Adapters)

- **Domain Layer**: Entities, Value Objects, Aggregates with zero external dependencies
- **Application Layer**: Use Cases, ports (repository interfaces), business logic orchestration
- **Adapters Layer**: Controllers, repository implementations, database, external APIs

**Domain-Driven Design** primitives provided by `@packages/ddd-kit`:

- `Result<T, E>` - Type-safe error handling without exceptions
- `Option<T>` - Eliminate null/undefined bugs
- `Entity` / `ValueObject` / `Aggregate` - Building blocks for domain models
- `DomainEvents` - Event-driven architecture

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript 5.9 |
| **Database** | PostgreSQL, Drizzle ORM |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Build System** | Turborepo, PNPM workspaces |
| **Code Quality** | Biome (linter + formatter), Vitest |
| **DI Container** | @evyweb/ioctopus |

### AI-Friendly Development

- `CLAUDE.md` - Complete architectural documentation for AI assistants
- `.cursorrules` - Coding patterns and anti-patterns for Cursor/Claude
- Helper scripts - Generate boilerplate with `./scripts/`
- Comprehensive inline documentation

## 📦 Project Structure

```
cleanstack/
├── apps/
│   └── nextjs/              # Main Next.js application
│       ├── app/             # App Router pages & layouts
│       ├── common/          # DI container, translations, providers
│       └── src/             # Clean Architecture layers
│           ├── domain/      # Entities, value objects, aggregates (zero dependencies)
│           ├── application/ # Use cases & ports (repository interfaces)
│           └── adapters/    # Controllers, repositories, database, external APIs
├── packages/
│   ├── ddd-kit/         # DDD primitives (Entity, ValueObject, Aggregate, Result, Option)
│   ├── drizzle/         # Database schema & migrations
│   ├── ui/              # shadcn/ui components + brutalist design system
│   └── test/            # Shared test utilities
```

### Clean Architecture Layers

CleanStack follows Clean Architecture with strict dependency rules:

```
Adapters → Application → Domain
    ↓           ↓            ↓
Controllers  Use Cases   Entities & Value Objects
Repositories Ports       Aggregates & Events
Database
External APIs
```

Dependencies flow **inward only**. The domain layer has zero external dependencies.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** `≥ 24.12.0` ([download](https://nodejs.org))
- **PNPM** `10.26.2` (installed via `corepack enable`)
- **Docker Desktop** ([download](https://docker.com/get-started)) - for PostgreSQL

**Check your setup:**
```bash
node --version  # Should be ≥ v24.12.0
pnpm --version  # Should be 10.26.2
docker --version
```

### Step-by-Step Installation

#### 1️⃣ Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/axelhamil/nextjs-clean-architecture-starter cleanstack
cd cleanstack

# Install dependencies (this might take a few minutes)
pnpm install
```

**What this does:** Installs all packages for the monorepo (Next.js app, DDD toolkit, Drizzle ORM, UI components).

#### 2️⃣ Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

**What's inside `.env`:**
- `DATABASE_URL` - PostgreSQL connection string (pre-configured for Docker)
- Other app-specific variables

**Note:** The default `.env` works out of the box. You don't need to change anything for local development.

#### 3️⃣ Start Database

```bash
# Start PostgreSQL in Docker
pnpm db
```

**What this does:**
- Runs `docker compose up -d postgres`
- Starts PostgreSQL 17 on `localhost:5432`
- Creates a database named `cleanstack`

**Verify it's running:**
```bash
docker ps
# You should see a postgres container running
```

#### 4️⃣ Initialize Database Schema

```bash
# Push schema to database
pnpm db:push
```

**What this does:**
- Reads schema definitions from `packages/drizzle/src/schema/`
- Creates tables in your PostgreSQL database
- Generates TypeScript types for type-safe queries

#### 5️⃣ Start Development Server

```bash
# Start Next.js dev server
pnpm dev
```

**What this does:**
- Runs `db:generate` to ensure DB types are up to date
- Starts Next.js on `http://localhost:3000`
- Enables hot-reload for code changes

**Visit:** [http://localhost:3000](http://localhost:3000)

You should see the CleanStack landing page!

### Verify Your Installation

Run all quality checks to ensure everything works:

```bash
pnpm validate
```

This runs:
- ✅ TypeScript type checking (`pnpm type-check`)
- ✅ Biome linting (`pnpm check`)
- ✅ All tests (`pnpm test`)

If everything passes, you're ready to build!

### Next Steps

**New to Clean Architecture?**
1. Read [`CLAUDE.md`](./CLAUDE.md) - Complete architectural guide
2. Explore the example user module in `apps/nextjs/src/`
3. Follow the [Your First Use Case](#your-first-use-case) tutorial below

**Experienced developer?**
1. Check `.cursorrules` for coding patterns
2. Review `packages/ddd-kit/` primitives (Result, Option, Entity, etc.)
3. Start building your domain models

### Troubleshooting

**`pnpm db` fails - Port 5432 already in use**

Another PostgreSQL instance is running. Either:
```bash
# Option 1: Stop the other PostgreSQL
sudo systemctl stop postgresql

# Option 2: Change the port in docker-compose.yml
# Edit ports to "5433:5432" and update DATABASE_URL in .env
```

**`pnpm dev` fails - Database connection error**

Ensure PostgreSQL is running:
```bash
docker ps  # Check if postgres container is running
pnpm db    # Restart if needed
```

**`pnpm db:push` fails - Migration errors**

Reset the database:
```bash
docker compose down -v  # Remove volumes
pnpm db                 # Restart
pnpm db:push           # Retry
```

**TypeScript errors after `git pull`**

Regenerate database types:
```bash
pnpm db:generate
```

**Port 3000 already in use**

Change the port:
```bash
PORT=3001 pnpm dev
```

**Still having issues?** [Open an issue](https://github.com/axelhamil/nextjs-clean-architecture-starter/issues)

---

## Your First Use Case

Let's build a simple "Create Product" feature to understand the architecture.

### Step 1: Define the Domain

Create a Product Value Object and Entity:

**`apps/nextjs/src/domain/product/ProductName.ts`**
```typescript
import { Result, ValueObject } from '@packages/ddd-kit'

interface ProductNameProps {
  value: string
}

export class ProductName extends ValueObject<ProductNameProps> {
  // ✅ Only implement validate() - everything else is provided by ValueObject parent class
  protected validate(props: ProductNameProps): Result<ProductNameProps> {
    if (!props.value || props.value.trim().length === 0) {
      return Result.fail('Product name cannot be empty')
    }
    if (props.value.length > 100) {
      return Result.fail('Product name too long')
    }
    return Result.ok({ value: props.value.trim() })
  }
}

// Usage: ProductName.create({ value: "My Product" })
// Access: productName.value.value
```

**`apps/nextjs/src/domain/product/Product.ts`**
```typescript
import { Entity, Result, UUID } from '@packages/ddd-kit'
import type { ProductName } from './ProductName'

interface ProductProps {
  name: ProductName
  price: number
}

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id?: UUID) {
    super(props, id)
  }

  // ✅ No manual getters - use get() provided by Entity

  static create(props: ProductProps, id?: UUID): Result<Product> {
    if (props.price < 0) {
      return Result.fail('Price cannot be negative')
    }
    return Result.ok(new Product(props, id))
  }

  // Business logic methods
  canBePurchased(): boolean {
    return this.get('price') > 0  // ✅ Use get() to access props
  }
}

// Usage:
// const name = product.get('name')  // Type-safe access
// const price = product.get('price')
```

### Step 2: Define the Repository Interface (Port)

**`apps/nextjs/src/application/ports/IProductRepository.ts`**
```typescript
import type { BaseRepository } from '@packages/ddd-kit'
import type { Product } from '@/domain/product/Product'

export interface IProductRepository extends BaseRepository<Product> {
  // Add custom methods if needed
}
```

### Step 3: Create the Use Case

**`apps/nextjs/src/application/use-cases/CreateProductUseCase.ts`**
```typescript
import { Result, type UseCase } from '@packages/ddd-kit'
import { Product } from '@/domain/product/Product'
import { ProductName } from '@/domain/product/ProductName'
import type { IProductRepository } from '@/application/ports/IProductRepository'

interface CreateProductInput {
  name: string
  price: number
}

export class CreateProductUseCase implements UseCase<CreateProductInput, Product> {
  constructor(private readonly productRepo: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<Result<Product>> {
    // 1. Create Value Objects
    const nameOrError = ProductName.create({ value: input.name })
    if (nameOrError.isFailure) {
      return Result.fail(nameOrError.error)
    }

    // 2. Create Entity
    const productOrError = Product.create({
      name: nameOrError.value,
      price: input.price
    })
    if (productOrError.isFailure) {
      return Result.fail(productOrError.error)
    }

    // 3. Persist
    const savedOrError = await this.productRepo.create(productOrError.value)
    if (savedOrError.isFailure) {
      return Result.fail(savedOrError.error)
    }

    return Result.ok(savedOrError.value)
  }
}
```

### Step 4: Implement the Repository

**`packages/drizzle/src/schema/products.ts`**
```typescript
import { pgTable, text, real, uuid, timestamp } from 'drizzle-orm/pg-core'

export const products = pgTable('products', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

**`apps/nextjs/src/adapters/out/persistence/DrizzleProductRepository.ts`**
```typescript
import { Result, Option, type UUID } from '@packages/ddd-kit'
import { db } from '@packages/drizzle'
import { products } from '@packages/drizzle/schema'
import { eq } from 'drizzle-orm'
import type { IProductRepository } from '@/application/ports/IProductRepository'
import type { Product } from '@/domain/product/Product'
import { ProductMapper } from './mappers/ProductMapper'

export class DrizzleProductRepository implements IProductRepository {
  async create(product: Product): Promise<Result<Product>> {
    try {
      const raw = ProductMapper.toPersistence(product)
      await db.insert(products).values(raw)
      return Result.ok(product)
    } catch (error) {
      return Result.fail('Failed to create product')
    }
  }

  async findById(id: UUID): Promise<Result<Option<Product>>> {
    try {
      const row = await db.query.products.findFirst({
        where: eq(products.id, id.value)
      })
      if (!row) return Result.ok(Option.none())  // ✅ Use static factory

      const productOrError = ProductMapper.toDomain(row)
      if (productOrError.isFailure) return Result.fail(productOrError.error)

      return Result.ok(Option.some(productOrError.value))  // ✅ Use static factory
    } catch (error) {
      return Result.fail('Failed to find product')
    }
  }

  // Implement other BaseRepository methods...
}
```

### Step 5: Register in DI Container

**`apps/nextjs/src/common/di/modules/product.module.ts`**
```typescript
import type { ApplicationContainer } from '@evyweb/ioctopus'
import { DrizzleProductRepository } from '@/adapters/out/persistence/DrizzleProductRepository'
import { CreateProductUseCase } from '@/application/use-cases/CreateProductUseCase'

export const productModule = (container: ApplicationContainer) => {
  container.bind('IProductRepository').toClass(DrizzleProductRepository)
  container.bind('CreateProductUseCase').toClass(CreateProductUseCase)
}
```

**`apps/nextjs/src/common/di/container.ts`**
```typescript
import { productModule } from './modules/product.module'

// Add to container initialization
productModule(container)
```

### Step 6: Create API Route

**`apps/nextjs/src/app/api/products/route.ts`**
```typescript
import { getInjection } from '@/common/di/container'
import type { CreateProductUseCase } from '@/application/use-cases/CreateProductUseCase'

export async function POST(request: Request) {
  const useCase = getInjection('CreateProductUseCase')
  const body = await request.json()

  const result = await useCase.execute(body)

  if (result.isFailure) {
    return Response.json({ error: result.error }, { status: 400 })
  }

  const product = result.value
  return Response.json({
    id: product._id.value.toString(),
    name: product.get('name').value.value,  // ✅ Use get() for entity props
    price: product.get('price')
  }, { status: 201 })
}
```

### Step 7: Test It

```bash
# Generate and push DB schema
pnpm db:generate
pnpm db:push

# Test the API
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "My Product", "price": 29.99}'
```

**Congratulations!** You've just built a feature following Clean Architecture principles.

**Key Takeaways:**
- Domain layer has ZERO dependencies (just DDD-kit primitives)
- Application layer defines interfaces (ports), not implementations
- Infrastructure implements repositories
- Use Cases orchestrate business logic
- No exceptions thrown - everything returns `Result<T>`

---

## Development

### Commands Reference

| Command | Description |
|---------|-------------|
| **Development** |
| `pnpm dev` | Start dev server (auto-runs `db:generate`) |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| **Code Quality** |
| `pnpm validate` | Run type-check + lint + test |
| `pnpm type-check` | TypeScript type checking |
| `pnpm check` | Biome lint check (no fixes) |
| `pnpm format` | Format code with Biome |
| `pnpm test` | Run all tests with Vitest |
| `pnpm test:watch` | Run tests in watch mode |
| **Database** |
| `pnpm db` | Start PostgreSQL container |
| `pnpm db:push` | Push schema to DB (dev only) |
| `pnpm db:generate` | Generate migrations from schema |
| `pnpm db:migrate` | Run migrations (production) |
| `pnpm db:studio` | Open Drizzle Studio UI |
| **Utilities** |
| `pnpm ui:add` | Add shadcn/ui component |
| `pnpm clean` | Remove build artifacts |

### Development Workflow

**Making Schema Changes:**
```bash
# 1. Edit schema in packages/drizzle/src/schema/
# 2. Generate migration
pnpm db:generate

# 3. Apply to database
pnpm db:push  # Development
pnpm db:migrate  # Production
```

**Adding a New Use Case:**
```bash
# 1. Create domain models (Entity, Value Objects)
# 2. Define repository interface in application/ports/
# 3. Implement use case in application/use-cases/
# 4. Implement repository in adapters/out/
# 5. Register in DI container (common/di/modules/)
# 6. Create API route in app/api/
```

**Running Tests:**
```bash
# All tests
pnpm test

# Specific package
cd packages/ddd-kit && pnpm test

# With coverage
pnpm test:coverage
```

---

## Documentation

### Core Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive architecture guide for AI assistants and developers
- **[.cursorrules](./.cursorrules)** - Coding patterns and anti-patterns for AI tools
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Community guidelines

### Package Documentation

- **[@packages/ddd-kit](./packages/ddd-kit/)** - DDD primitives (Entity, ValueObject, Result, Option)
- **[@packages/drizzle](./packages/drizzle/)** - Database schema and ORM
- **[@packages/ui](./packages/ui/)** - shadcn/ui components and design system

### Key Patterns

**Result<T>** - Type-safe error handling
```typescript
const result = Email.create("user@example.com")
if (result.isFailure) return Result.fail(result.error)
return Result.ok(result.value)
```

**Option<T>** - Null safety
```typescript
import { match } from '@packages/ddd-kit'

const result = await repo.findById(id) // Result<Option<User>>
if (result.isFailure) return Result.fail(result.error)

const userOption = result.value
return match(userOption, {
  Some: (user) => user.get('name'),
  None: () => "User not found"
})
```

**Immutability** - Domain objects are immutable
```typescript
// Value Objects are automatically frozen by parent class
export class Email extends ValueObject<EmailProps> {
  protected validate(props: EmailProps): Result<EmailProps> {
    // Validation logic
    return Result.ok(props)
  }
  // No need to call Object.freeze() - parent class handles it
}

// Entities use clone() to create new instances
updateEmail(email: Email): Result<User> {
  return Result.ok(this.clone({ email }))  // ✅ Use clone()
}
```

---

## When to Use CleanStack

**Perfect for:**
- Enterprise applications with complex business logic
- Long-term projects requiring maintainability
- Teams needing clear architectural boundaries
- Projects with evolving requirements
- Applications requiring extensive testing
- AI-assisted development workflows

**Not ideal for:**
- Simple CRUD apps or MVPs
- Quick prototypes
- Projects with minimal business rules
- Solo projects with tight deadlines

---

## Contributing

Contributions are welcome! Please:

1. Read [CLAUDE.md](./CLAUDE.md) to understand the architecture
2. Check [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines
3. Follow the Result<T> and Option<T> patterns
4. Respect the dependency rule (Domain → Application → Adapters → Infrastructure)
5. Add tests for new features

---

## License

MIT © [AxelHamil](https://github.com/axelhamil)

---

<div align="center">

**Built with [Claude Code](https://claude.ai/code)**

Give it a ⭐ if you find it useful!

[Report Bug](https://github.com/axelhamil/nextjs-clean-architecture-starter/issues) · [Request Feature](https://github.com/axelhamil/nextjs-clean-architecture-starter/issues)

</div>