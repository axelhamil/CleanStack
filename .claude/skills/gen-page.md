---
name: gen-page
description: Generate Next.js pages with server components, layouts, route groups, and _components folder structure
---

# Page Generator

Generate production-ready Next.js pages following the project's server/client component patterns. Pages are thin orchestrators, logic lives in `_components/`.

Reference: `app/(protected)/dashboard/` and `app/(auth)/login/`

## Architecture Overview

```
app/(route-group)/
├── layout.tsx          ← Server: Auth guard, shared UI
├── page.tsx            ← Server: Data fetching, composition
└── _components/
    ├── feature-card.tsx    ← Server: Presentational
    └── interactive-form.tsx ← Client: User interaction
```

## Input

Page specification:
- Route path (e.g., `/dashboard`, `/settings/billing`)
- Protection level (public, authenticated, admin)
- Data requirements (what to fetch)
- UI components needed

## Output Files

### 1. Protected Page with Data Fetching
`app/(protected)/{route}/page.tsx`

```typescript
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getInjection } from "@/common/di/container";
import { {FeatureName}Card } from "./_components/{feature-name}-card";
import { {FeatureName}Header } from "./_components/{feature-name}-header";

export default async function {PageName}Page() {
  // 1. Check authentication (redirects if not authenticated)
  const session = await requireAuth();

  // 2. Fetch data via use case or query
  const useCase = getInjection("Get{Feature}UseCase");
  const result = await useCase.execute({
    userId: session.user.id,
  });

  // 3. Handle error case
  if (result.isFailure) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load data. Please try again.
      </div>
    );
  }

  const data = result.getValue();

  // 4. Compose with child components
  return (
    <div className="space-y-8">
      <{FeatureName}Header userName={session.user.name} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <{FeatureName}Card data={data} />
      </div>
    </div>
  );
}
```

### 2. Public Page
`app/{route}/page.tsx`

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import { {FeatureName}Form } from "./_components/{feature-name}-form";

export default function {PageName}Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{Title}</CardTitle>
          <CardDescription>
            {Description text}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <{FeatureName}Form />
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Layout with Auth Guard
`app/(protected)/layout.tsx`

```typescript
import type { ReactElement, ReactNode } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { Sidebar } from "./_components/sidebar";
import { Header } from "./_components/header";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  // Auth check at layout level protects all child pages
  const session = await requireAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 4. Nested Layout (e.g., settings)
`app/(protected)/settings/layout.tsx`

```typescript
import type { ReactElement, ReactNode } from "react";
import { SettingsNav } from "./_components/settings-nav";

export default function SettingsLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <div className="flex gap-8">
      <aside className="w-64 shrink-0">
        <SettingsNav />
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

### 5. Server Component (Presentational)
`app/(protected)/{route}/_components/{feature-name}-card.tsx`

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";
import type { I{Feature}OutputDto } from "@/application/dto/{feature}/{feature}.dto";

interface {FeatureName}CardProps {
  data: I{Feature}OutputDto;
}

export function {FeatureName}Card({ data }: {FeatureName}CardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">Field</span>
          <p className="font-medium">{data.field}</p>
        </div>
        {/* More fields */}
      </CardContent>
    </Card>
  );
}
```

### 6. Client Component with Server Action
`app/(protected)/{route}/_components/{feature-name}-form.tsx`

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@packages/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@packages/ui/components/ui/form";
import { Input } from "@packages/ui/components/ui/input";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { create{Feature}Action } from "@/adapters/actions/{feature}.actions";

const formSchema = z.object({
  field1: z.string().min(1, "Field is required"),
  field2: z.string().email("Invalid email"),
});

type FormValues = z.infer<typeof formSchema>;

interface {FeatureName}FormProps {
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
}

export function {FeatureName}Form({
  initialData,
  onSuccess,
}: {FeatureName}FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      field1: initialData?.field1 ?? "",
      field2: initialData?.field2 ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await create{Feature}Action(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("{Feature} created successfully");
      onSuccess?.();
      router.push("/{features}");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="field1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field 1</FormLabel>
              <FormControl>
                <Input placeholder="Enter value..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="field2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

### 7. List Page with Pagination
`app/(protected)/{features}/page.tsx`

```typescript
import { requireAuth } from "@/adapters/guards/auth.guard";
import { getInjection } from "@/common/di/container";
import { {Feature}List } from "./_components/{feature}-list";
import { {Feature}ListHeader } from "./_components/{feature}-list-header";
import { Pagination } from "@/components/pagination";

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function {Features}Page({ searchParams }: PageProps) {
  const session = await requireAuth();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;

  const useCase = getInjection("List{Features}UseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    pagination: { page, limit },
  });

  if (result.isFailure) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load {features}.
      </div>
    );
  }

  const { data, pagination } = result.getValue();

  return (
    <div className="space-y-6">
      <{Feature}ListHeader count={pagination.total} />

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No {features} yet. Create your first one!
        </div>
      ) : (
        <>
          <{Feature}List items={data} />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
          />
        </>
      )}
    </div>
  );
}
```

## File Structure

```
app/
├── (auth)/                         # Public auth pages
│   ├── layout.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── _components/
│   │       └── login-form.tsx
│   └── register/
│       ├── page.tsx
│       └── _components/
│           └── register-form.tsx
├── (protected)/                    # Authenticated pages
│   ├── layout.tsx                  # Auth guard here
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── _components/
│   │       ├── stats-card.tsx
│   │       └── recent-activity.tsx
│   ├── settings/
│   │   ├── layout.tsx              # Settings nav
│   │   ├── page.tsx                # Profile settings
│   │   ├── billing/
│   │   │   └── page.tsx
│   │   └── _components/
│   │       └── settings-nav.tsx
│   └── {feature}/
│       ├── page.tsx                # List
│       ├── new/
│       │   └── page.tsx            # Create
│       ├── [id]/
│       │   ├── page.tsx            # View/Edit
│       │   └── _components/
│       └── _components/
│           ├── {feature}-card.tsx
│           └── {feature}-form.tsx
└── _components/                    # Shared app components
    └── pagination.tsx
```

## Route Groups

| Group | Purpose | Auth |
|-------|---------|------|
| `(auth)` | Login, register, forgot password | Public |
| `(protected)` | Dashboard, settings, features | Required |
| `(admin)` | Admin-only pages | Required + admin role |
| `(marketing)` | Landing, pricing, docs | Public |

## Conventions

1. **Server by default** - Pages are async server components
2. **Client in _components** - Interactive components marked with "use client"
3. **Thin pages** - Pages compose components, don't contain logic
4. **Route groups** - Use `(name)` for organization without URL impact
5. **Auth in layouts** - `requireAuth()` at layout level for protection
6. **Data fetching in pages** - Fetch data in page, pass to components
7. **shadcn/ui components** - Use `@packages/ui/components/ui/`
8. **No index.ts** - Import directly from component files

## Auth Guard Pattern

```typescript
// src/adapters/guards/auth.guard.ts
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getInjection } from "@/common/di/container";

export async function requireAuth(
  redirectTo = "/login",
): Promise<IGetSessionOutputDto> {
  const headersList = await headers();
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headersList);

  if (result.isFailure) {
    redirect(redirectTo);
  }

  const sessionOption = result.getValue();
  if (sessionOption.isNone()) {
    redirect(redirectTo);
  }

  return sessionOption.unwrap();
}
```

## Example Usage

```
/gen-page Dashboard (protected):
- Route: /dashboard
- Data: User stats, recent activity
- Components: StatsCard, RecentActivityList
```

```
/gen-page Bookmarks list (protected):
- Route: /bookmarks
- Data: Paginated bookmarks list
- Components: BookmarkList, BookmarkCard, Pagination
```

```
/gen-page Settings/Billing (protected, nested):
- Route: /settings/billing
- Data: Subscription info, payment methods
- Components: SubscriptionCard, PaymentMethodList, ManageButton
```

```
/gen-page Login (public, auth group):
- Route: /login
- Components: LoginForm with email/password
- Redirect to /dashboard on success
```
