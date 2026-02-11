---
name: gen-query
description: Generate CQRS read model queries for efficient data retrieval bypassing domain layer
---

# Query Generator (CQRS Read Side)

Generate production-ready CQRS query classes for read operations. Queries bypass the domain layer and access the database directly via ORM for optimized reads.

Reference: CQRS pattern in `CLAUDE.md`

## When to Use Queries vs Use Cases

```
Need to modify data?
├─ Yes → Use Case (through domain layer)
└─ No → Need domain logic?
        ├─ Yes → Use Case (returns aggregate)
        └─ No → Is this a simple read?
                ├─ Yes → Query (direct ORM) ✓
                └─ No → Use Case + DTO
```

**Use Queries when:**
- Dashboard statistics
- List views with filters/pagination
- Reports and analytics
- Data export
- No business logic needed

**Use Use Cases when:**
- Creating/updating entities
- Need to apply business rules
- Need aggregate with full state

## Input

Query specification:
- Query name (e.g., `GetUserDashboard`, `ListOrdersByStatus`)
- Input parameters (filters, pagination)
- Output shape (fields needed)
- Data source(s)

## Output Files

### 1. Query Class
`src/adapters/queries/{domain}/{query-name}.query.ts`

```typescript
import { Result } from "@packages/ddd-kit";
import { db } from "@packages/drizzle";
import {
  type PaginatedResult,
  type PaginationParams,
  createPaginatedResult,
  DEFAULT_PAGINATION,
} from "@packages/ddd-kit";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { {tableName} } from "@packages/drizzle/schema/{table-name}";
import type { I{QueryName}InputDto, I{QueryName}OutputDto } from "@/application/dto/{domain}/{query-name}.dto";

export class {QueryName}Query {
  async execute(
    input: I{QueryName}InputDto,
  ): Promise<Result<I{QueryName}OutputDto>> {
    try {
      // Direct ORM access (bypasses domain layer)
      const result = await db.query.{tableName}.findFirst({
        where: eq({tableName}.id, input.id),
        columns: {
          id: true,
          name: true,
          // Select only needed columns
        },
        with: {
          // Include relations if needed
          relatedEntity: {
            columns: { id: true, name: true },
          },
        },
      });

      if (!result) {
        return Result.fail("{Entity} not found");
      }

      return Result.ok(this.toDto(result));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : "Query failed",
      );
    }
  }

  private toDto(data: DbResult): I{QueryName}OutputDto {
    return {
      id: data.id,
      name: data.name,
      // Map to output DTO shape
    };
  }
}
```

### 2. Paginated Query
`src/adapters/queries/{domain}/{list-query-name}.query.ts`

```typescript
import { Result } from "@packages/ddd-kit";
import { db } from "@packages/drizzle";
import {
  type PaginatedResult,
  type PaginationParams,
  createPaginatedResult,
  DEFAULT_PAGINATION,
} from "@packages/ddd-kit";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { {tableName} } from "@packages/drizzle/schema/{table-name}";
import type {
  I{QueryName}InputDto,
  I{QueryName}OutputDto,
} from "@/application/dto/{domain}/{query-name}.dto";

export class {QueryName}Query {
  async execute(
    input: I{QueryName}InputDto,
  ): Promise<Result<PaginatedResult<I{QueryName}ItemDto>>> {
    try {
      const pagination = input.pagination ?? DEFAULT_PAGINATION;
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];
      if (input.userId) {
        conditions.push(eq({tableName}.userId, input.userId));
      }
      if (input.status) {
        conditions.push(eq({tableName}.status, input.status));
      }

      const whereClause = conditions.length > 0
        ? and(...conditions)
        : undefined;

      // Execute parallel queries for data and count
      const [items, totalResult] = await Promise.all([
        db.query.{tableName}.findMany({
          where: whereClause,
          columns: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: [desc({tableName}.createdAt)],
          limit,
          offset,
        }),
        db
          .select({ count: count() })
          .from({tableName})
          .where(whereClause),
      ]);

      const total = totalResult[0]?.count ?? 0;
      const data = items.map(this.toDto);

      return Result.ok(createPaginatedResult(data, pagination, total));
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : "Query failed",
      );
    }
  }

  private toDto(item: DbItem): I{QueryName}ItemDto {
    return {
      id: item.id,
      name: item.name,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
    };
  }
}
```

### 3. Aggregation Query
`src/adapters/queries/{domain}/{stats-query-name}.query.ts`

```typescript
import { Result } from "@packages/ddd-kit";
import { db } from "@packages/drizzle";
import { eq, sql, count, sum, avg } from "drizzle-orm";
import { {tableName} } from "@packages/drizzle/schema/{table-name}";
import type {
  I{QueryName}InputDto,
  I{QueryName}OutputDto,
} from "@/application/dto/{domain}/{query-name}.dto";

export class {QueryName}Query {
  async execute(
    input: I{QueryName}InputDto,
  ): Promise<Result<I{QueryName}OutputDto>> {
    try {
      const result = await db
        .select({
          totalCount: count(),
          totalAmount: sum({tableName}.amount),
          averageAmount: avg({tableName}.amount),
        })
        .from({tableName})
        .where(eq({tableName}.userId, input.userId));

      const stats = result[0];

      return Result.ok({
        totalCount: Number(stats?.totalCount ?? 0),
        totalAmount: Number(stats?.totalAmount ?? 0),
        averageAmount: Number(stats?.averageAmount ?? 0),
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : "Query failed",
      );
    }
  }
}
```

### 4. Query DTOs
`src/application/dto/{domain}/{query-name}.dto.ts`

```typescript
import { z } from "zod";
import { paginationParamsSchema } from "@packages/ddd-kit";

// Input DTO
export const {queryName}InputDtoSchema = z.object({
  userId: z.string(),
  status: z.string().optional(),
  pagination: paginationParamsSchema.optional(),
});

export type I{QueryName}InputDto = z.infer<typeof {queryName}InputDtoSchema>;

// Output DTO (single item)
export const {queryName}OutputDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export type I{QueryName}OutputDto = z.infer<typeof {queryName}OutputDtoSchema>;

// Output DTO (list item - for paginated queries)
export const {queryName}ItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

export type I{QueryName}ItemDto = z.infer<typeof {queryName}ItemDtoSchema>;
```

### 5. DI Registration (Optional)
`common/di/modules/{domain}.module.ts`

```typescript
import { {QueryName}Query } from "@/adapters/queries/{domain}/{query-name}.query";
import { DI_SYMBOLS } from "../types";

// Add to module
module.bind(DI_SYMBOLS.{QueryName}Query).toClass({QueryName}Query);
```

## File Structure

```
src/adapters/queries/
└── {domain}/
    ├── get-{entity}.query.ts           # Single entity fetch
    ├── list-{entities}.query.ts        # Paginated list
    ├── get-{entity}-stats.query.ts     # Aggregations
    └── search-{entities}.query.ts      # Full-text search
```

## Query Patterns

### Join Query
```typescript
const result = await db.query.orders.findMany({
  where: eq(orders.userId, input.userId),
  with: {
    items: {
      columns: { id: true, productId: true, quantity: true },
      with: {
        product: {
          columns: { name: true, price: true },
        },
      },
    },
    customer: {
      columns: { name: true, email: true },
    },
  },
});
```

### Search Query
```typescript
const result = await db.query.products.findMany({
  where: or(
    ilike(products.name, `%${input.search}%`),
    ilike(products.description, `%${input.search}%`),
  ),
  limit: input.limit,
});
```

### Date Range Query
```typescript
const result = await db.query.orders.findMany({
  where: and(
    eq(orders.userId, input.userId),
    gte(orders.createdAt, input.startDate),
    lte(orders.createdAt, input.endDate),
  ),
});
```

## Conventions

1. **No domain objects** - Queries return DTOs directly, not aggregates
2. **Result<T>** - Always wrap returns in Result for error handling
3. **Pagination** - Use `PaginatedResult<T>` for lists
4. **Select only needed columns** - Optimize for minimal data transfer
5. **Parallel queries** - Use `Promise.all` for count + data
6. **No mutations** - Queries are read-only
7. **Error handling** - Catch DB errors and return Result.fail

## Example Usage

```
/gen-query GetUserDashboard for User domain:
- Input: userId
- Output: user profile, recent orders count, total spent
- Data: users table + orders aggregation
```

```
/gen-query ListOrdersByStatus for Order domain:
- Input: userId, status (optional), pagination
- Output: paginated order list with items
- Data: orders with items relation
```
