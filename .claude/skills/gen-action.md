---
name: gen-action
description: Generate Next.js server actions with input validation, DI injection, and transaction support
---

# Server Action Generator

Generate production-ready Next.js server actions following project patterns. Actions bridge UI components and application use cases.

Reference: `src/adapters/actions/`

## Architecture Overview

```
Client Component
    │
    ▼
Server Action (validates input)
    │
    ▼
Use Case (via DI injection)
    │
    ▼
ActionResult<T> → Client
```

## Input

Action specification:
- Feature/domain name
- Actions needed (create, update, delete, get, list)
- Use cases to call
- Transaction requirements

## Output Files

### 1. Action Utilities (if not exists)
`src/adapters/actions/action.utils.ts`

```typescript
import type { Result } from "@packages/ddd-kit";
import type { z } from "zod";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function parseInput<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { success: false; error: string } | { success: true; data: T } {
  const result = schema.safeParse(input);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message ?? "Invalid input",
    };
  }
  return { success: true, data: result.data };
}

export function isParseError<T>(
  result: ActionResult<T>,
): result is { success: false; error: string } {
  return !result.success;
}

export function toActionResult<T>(result: Result<T>): ActionResult<T> {
  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }
  return { success: true, data: result.getValue() };
}
```

### 2. Feature Actions File
`src/adapters/actions/{feature}.actions.ts`

```typescript
"use server";

import {
  type ActionResult,
  isParseError,
  parseInput,
  toActionResult,
} from "./action.utils";
import {
  create{Entity}InputDtoSchema,
  type ICreate{Entity}OutputDto,
} from "@/application/dto/{feature}/create-{entity}.dto";
import {
  update{Entity}InputDtoSchema,
  type IUpdate{Entity}OutputDto,
} from "@/application/dto/{feature}/update-{entity}.dto";
import {
  delete{Entity}InputDtoSchema,
  type IDelete{Entity}OutputDto,
} from "@/application/dto/{feature}/delete-{entity}.dto";
import { getInjection } from "@/common/di/container";

/**
 * Create a new {Entity}
 */
export async function create{Entity}Action(
  input: unknown,
): Promise<ActionResult<ICreate{Entity}OutputDto>> {
  // 1. Parse and validate input
  const parsed = parseInput(create{Entity}InputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  // 2. Get use case via DI
  const useCase = getInjection("Create{Entity}UseCase");

  // 3. Execute and transform result
  return toActionResult(await useCase.execute(parsed.data));
}

/**
 * Update an existing {Entity}
 */
export async function update{Entity}Action(
  input: unknown,
): Promise<ActionResult<IUpdate{Entity}OutputDto>> {
  const parsed = parseInput(update{Entity}InputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("Update{Entity}UseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

/**
 * Delete a {Entity}
 */
export async function delete{Entity}Action(
  input: unknown,
): Promise<ActionResult<IDelete{Entity}OutputDto>> {
  const parsed = parseInput(delete{Entity}InputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("Delete{Entity}UseCase");
  return toActionResult(await useCase.execute(parsed.data));
}
```

### 3. Action with Transaction
`src/adapters/actions/{feature}.actions.ts`

```typescript
"use server";

import {
  type ActionResult,
  isParseError,
  parseInput,
  toActionResult,
} from "./action.utils";
import {
  delete{Entity}InputDtoSchema,
  type IDelete{Entity}OutputDto,
} from "@/application/dto/{feature}/delete-{entity}.dto";
import { getInjection } from "@/common/di/container";

/**
 * Delete {Entity} with transaction support
 * Use when operation involves multiple repositories
 */
export async function delete{Entity}Action(
  input: unknown,
): Promise<ActionResult<IDelete{Entity}OutputDto>> {
  const parsed = parseInput(delete{Entity}InputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  // Get transaction manager
  const transaction = getInjection("ITransactionManagerService");
  const useCase = getInjection("Delete{Entity}UseCase");

  // Wrap in transaction
  const result = await transaction.startTransaction(async (trx) => {
    return useCase.execute(parsed.data, trx);
  });

  return toActionResult(result);
}
```

### 4. Action with Auth Context
`src/adapters/actions/{feature}.actions.ts`

```typescript
"use server";

import { headers } from "next/headers";
import {
  type ActionResult,
  isParseError,
  parseInput,
  toActionResult,
} from "./action.utils";
import {
  create{Entity}InputDtoSchema,
  type ICreate{Entity}OutputDto,
} from "@/application/dto/{feature}/create-{entity}.dto";
import { getInjection } from "@/common/di/container";

/**
 * Create {Entity} for authenticated user
 */
export async function create{Entity}Action(
  input: unknown,
): Promise<ActionResult<ICreate{Entity}OutputDto>> {
  // 1. Get session
  const headersList = await headers();
  const getSessionUseCase = getInjection("GetSessionUseCase");
  const sessionResult = await getSessionUseCase.execute(headersList);

  if (sessionResult.isFailure) {
    return { success: false, error: "Unauthorized" };
  }

  const sessionOption = sessionResult.getValue();
  if (sessionOption.isNone()) {
    return { success: false, error: "Unauthorized" };
  }

  const session = sessionOption.unwrap();

  // 2. Parse input
  const parsed = parseInput(create{Entity}InputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  // 3. Execute with user context
  const useCase = getInjection("Create{Entity}UseCase");
  return toActionResult(
    await useCase.execute({
      ...parsed.data,
      userId: session.user.id,
    }),
  );
}
```

### 5. Action with File Upload
`src/adapters/actions/{feature}.actions.ts`

```typescript
"use server";

import {
  type ActionResult,
  toActionResult,
} from "./action.utils";
import { getInjection } from "@/common/di/container";
import { z } from "zod";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
});

/**
 * Upload file for {Entity}
 */
export async function upload{Entity}FileAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const file = formData.get("file") as File | null;
  const entityId = formData.get("entityId") as string | null;

  if (!file || !entityId) {
    return { success: false, error: "File and entityId are required" };
  }

  const validation = uploadSchema.safeParse({
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Invalid file",
    };
  }

  const useCase = getInjection("Upload{Entity}FileUseCase");
  return toActionResult(
    await useCase.execute({
      entityId,
      file: {
        name: file.name,
        type: file.type,
        buffer: Buffer.from(await file.arrayBuffer()),
      },
    }),
  );
}
```

## File Structure

```
src/adapters/actions/
├── action.utils.ts           # Shared utilities
├── auth.actions.ts           # Authentication actions
├── {feature}.actions.ts      # Feature-specific actions
├── {feature2}.actions.ts
└── ...
```

## Client Usage Pattern

```typescript
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { create{Entity}Action } from "@/adapters/actions/{feature}.actions";

export function Create{Entity}Form() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await create{Entity}Action(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("{Entity} created successfully");
      router.push("/{entities}");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

## Conventions

1. **"use server" directive** - Always at top of file
2. **One file per feature** - Group related actions together
3. **parseInput()** - Always validate with Zod schema
4. **toActionResult()** - Transform Result<T> to ActionResult<T>
5. **getInjection()** - Get use cases via DI
6. **No direct DB access** - Actions call use cases, not repositories
7. **Transaction wrapper** - Use for multi-repo operations
8. **Error messages** - User-friendly, from use case or validation

## Action Naming Convention

| Operation | Action Name | Use Case |
|-----------|-------------|----------|
| Create | `create{Entity}Action` | `Create{Entity}UseCase` |
| Read | `get{Entity}Action` | `Get{Entity}UseCase` |
| Update | `update{Entity}Action` | `Update{Entity}UseCase` |
| Delete | `delete{Entity}Action` | `Delete{Entity}UseCase` |
| List | `list{Entities}Action` | `List{Entities}UseCase` |
| Custom | `{verb}{Entity}Action` | `{Verb}{Entity}UseCase` |

## Example Usage

```
/gen-action Bookmark feature:
- createBookmarkAction → CreateBookmarkUseCase
- deleteBookmarkAction → DeleteBookmarkUseCase
- listBookmarksAction → ListBookmarksUseCase (paginated)

With auth context (user scoped operations)
```

```
/gen-action Order feature with transactions:
- createOrderAction → CreateOrderUseCase (with transaction)
- cancelOrderAction → CancelOrderUseCase (with transaction)

Multi-repo operations need transaction wrapper
```
