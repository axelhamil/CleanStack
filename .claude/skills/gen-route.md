---
name: gen-route
description: Generate Next.js API routes with thin route handlers and reusable controllers
---

# API Route Generator

Generate production-ready Next.js API routes following the thin route + controller pattern. Routes handle HTTP concerns, controllers orchestrate use cases.

Reference: `app/api/` and `src/adapters/controllers/`

## Architecture Overview

```
HTTP Request
    │
    ▼
Route Handler (app/api/.../route.ts)
    │ (extracts params, delegates)
    ▼
Controller (src/adapters/controllers/)
    │ (auth, validation, use case)
    ▼
Use Case (via DI)
    │
    ▼
HTTP Response
```

## Input

Route specification:
- Resource name and path
- HTTP methods (GET, POST, PUT, DELETE)
- Authentication requirement
- Request/response format
- Special handling (streaming, webhooks, file uploads)

## Output Files

### 1. Simple Route + Controller
`app/api/{resource}/route.ts`

```typescript
import { {createResourceName}Controller } from "@/adapters/controllers/{domain}/create-{resource}.controller";
import { {getResourceName}Controller } from "@/adapters/controllers/{domain}/get-{resource}.controller";

export async function POST(request: Request) {
  return {createResourceName}Controller(request);
}

export async function GET(request: Request) {
  return {getResourceName}Controller(request);
}
```

`src/adapters/controllers/{domain}/create-{resource}.controller.ts`

```typescript
import { NextResponse } from "next/server";
import { create{Resource}InputDtoSchema } from "@/application/dto/{domain}/create-{resource}.dto";
import { getInjection } from "@/common/di/container";

export async function create{Resource}Controller(request: Request) {
  // 1. Parse request body
  const json = await request.json();
  const parsed = create{Resource}InputDtoSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  // 2. Get and execute use case
  const useCase = getInjection("Create{Resource}UseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json(
      { error: result.getError() },
      { status: 400 },
    );
  }

  // 3. Return success response
  return NextResponse.json(result.getValue(), { status: 201 });
}
```

### 2. Authenticated Route + Controller
`app/api/{resource}/route.ts`

```typescript
import { list{Resources}Controller } from "@/adapters/controllers/{domain}/list-{resources}.controller";
import { create{Resource}Controller } from "@/adapters/controllers/{domain}/create-{resource}.controller";

export async function GET(request: Request) {
  return list{Resources}Controller(request);
}

export async function POST(request: Request) {
  return create{Resource}Controller(request);
}
```

`src/adapters/controllers/{domain}/list-{resources}.controller.ts`

```typescript
import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/api-auth.guard";
import { list{Resources}InputDtoSchema } from "@/application/dto/{domain}/list-{resources}.dto";
import { getInjection } from "@/common/di/container";

export async function list{Resources}Controller(request: Request) {
  // 1. Check authentication
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse query parameters
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;
  const status = url.searchParams.get("status") || undefined;

  const parsed = list{Resources}InputDtoSchema
    .omit({ userId: true })
    .safeParse({
      pagination: { page, limit },
      status,
    });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  // 3. Execute with user context
  const useCase = getInjection("List{Resources}UseCase");
  const result = await useCase.execute({
    ...parsed.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
```

### 3. Dynamic Route Parameter
`app/api/{resource}/[id]/route.ts`

```typescript
import { get{Resource}Controller } from "@/adapters/controllers/{domain}/get-{resource}.controller";
import { update{Resource}Controller } from "@/adapters/controllers/{domain}/update-{resource}.controller";
import { delete{Resource}Controller } from "@/adapters/controllers/{domain}/delete-{resource}.controller";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return get{Resource}Controller(request, id);
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return update{Resource}Controller(request, id);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return delete{Resource}Controller(request, id);
}
```

`src/adapters/controllers/{domain}/get-{resource}.controller.ts`

```typescript
import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/api-auth.guard";
import { getInjection } from "@/common/di/container";

export async function get{Resource}Controller(
  _request: Request,
  {resource}Id: string,
) {
  // 1. Auth check
  const guardResult = await authGuard();
  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Execute
  const useCase = getInjection("Get{Resource}UseCase");
  const result = await useCase.execute({
    {resource}Id,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();

    // Map domain errors to HTTP status codes
    if (error === "{Resource} not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error === "{Resource} access unauthorized") {
      return NextResponse.json({ error }, { status: 403 });
    }

    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
```

### 4. Streaming Response
`app/api/{resource}/stream/route.ts`

```typescript
import { stream{Resource}Controller } from "@/adapters/controllers/{domain}/stream-{resource}.controller";

export async function POST(request: Request) {
  return stream{Resource}Controller(request);
}
```

`src/adapters/controllers/{domain}/stream-{resource}.controller.ts`

```typescript
import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/api-auth.guard";
import { stream{Resource}InputDtoSchema } from "@/application/dto/{domain}/stream-{resource}.dto";
import { getInjection } from "@/common/di/container";

export async function stream{Resource}Controller(request: Request) {
  const guardResult = await authGuard();
  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = stream{Resource}InputDtoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("Stream{Resource}UseCase");
  const result = await useCase.execute({
    ...parsed.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  // Return streaming response
  const { stream, metadata } = result.getValue();
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Custom-Header": metadata.value,
    },
  });
}
```

### 5. Webhook Handler
`app/api/webhooks/{service}/route.ts`

```typescript
import { handle{Service}WebhookController } from "@/adapters/controllers/webhooks/handle-{service}-webhook.controller";

export async function POST(request: Request) {
  return handle{Service}WebhookController(request);
}
```

`src/adapters/controllers/webhooks/handle-{service}-webhook.controller.ts`

```typescript
import { headers } from "next/headers";
import { getInjection } from "@/common/di/container";

export async function handle{Service}WebhookController(request: Request) {
  // 1. Get raw body and signature
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("{service}-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing {service}-signature header" },
      { status: 400 },
    );
  }

  // 2. Verify and handle webhook
  const useCase = getInjection("Handle{Service}WebhookUseCase");
  const result = await useCase.execute({
    payload: body,
    signature,
  });

  if (result.isFailure) {
    console.error("[Webhook] Error:", result.getError());
    return Response.json({ error: result.getError() }, { status: 400 });
  }

  // 3. Acknowledge webhook
  return Response.json(result.getValue());
}
```

### 6. Nested Resource Route
`app/api/{parent}/[parentId]/{children}/route.ts`

```typescript
import { list{Children}Controller } from "@/adapters/controllers/{domain}/list-{children}.controller";
import { create{Child}Controller } from "@/adapters/controllers/{domain}/create-{child}.controller";

interface RouteParams {
  params: Promise<{ parentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { parentId } = await params;
  return list{Children}Controller(request, parentId);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { parentId } = await params;
  return create{Child}Controller(request, parentId);
}
```

## File Structure

```
app/api/
├── {resource}/
│   ├── route.ts                    # Collection endpoints
│   └── [id]/
│       └── route.ts                # Item endpoints
├── {parent}/
│   └── [parentId]/
│       └── {children}/
│           └── route.ts            # Nested resources
└── webhooks/
    └── {service}/
        └── route.ts                # Webhook handlers

src/adapters/controllers/
├── {domain}/
│   ├── create-{resource}.controller.ts
│   ├── get-{resource}.controller.ts
│   ├── update-{resource}.controller.ts
│   ├── delete-{resource}.controller.ts
│   └── list-{resources}.controller.ts
└── webhooks/
    └── handle-{service}-webhook.controller.ts
```

## HTTP Status Codes

| Scenario | Status Code |
|----------|-------------|
| Success (GET, PUT) | 200 |
| Created (POST) | 201 |
| No Content (DELETE) | 204 |
| Bad Request (validation) | 400 |
| Unauthorized (no auth) | 401 |
| Forbidden (no access) | 403 |
| Not Found | 404 |
| Server Error | 500 |

## Conventions

1. **Thin routes** - Routes only delegate to controllers
2. **Controllers handle HTTP** - Auth, validation, status codes
3. **Use cases via DI** - `getInjection()` for dependency injection
4. **Zod validation** - Always validate with DTO schemas
5. **Error mapping** - Map domain errors to HTTP status codes
6. **Auth guard** - Use `authGuard()` for protected endpoints
7. **Query params** - Parse from URL for GET requests
8. **Path params** - Use Promise<{ id: string }> pattern

## Auth Guard Pattern

```typescript
// src/adapters/guards/api-auth.guard.ts
import { headers } from "next/headers";
import { getInjection } from "@/common/di/container";

export async function authGuard(): Promise<
  | { authenticated: true; session: { user: { id: string; email: string } } }
  | { authenticated: false }
> {
  const headersList = await headers();
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headersList);

  if (result.isFailure) {
    return { authenticated: false };
  }

  const sessionOption = result.getValue();
  if (sessionOption.isNone()) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    session: sessionOption.unwrap(),
  };
}
```

## Example Usage

```
/gen-route Bookmark resource:
- POST /api/bookmarks → create bookmark (auth required)
- GET /api/bookmarks → list user bookmarks (auth, paginated)
- DELETE /api/bookmarks/[id] → delete bookmark (auth, ownership check)
```

```
/gen-route Order resource with nested items:
- GET /api/orders → list orders
- POST /api/orders → create order
- GET /api/orders/[id] → get order
- GET /api/orders/[id]/items → list order items
- POST /api/orders/[id]/items → add item to order
```

```
/gen-route Stripe webhook:
- POST /api/webhooks/stripe → handle stripe events
- Verify signature, process events
```
