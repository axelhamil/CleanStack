# FTR-013: Settings Pages

## Story

**As a** user
**I want** settings pages
**So that** I can manage my account

## Acceptance Criteria

- [ ] Profile settings
- [ ] Billing settings
- [ ] Settings navigation
- [ ] Form validation
- [ ] Success/error feedback

## Implementation

### Settings Layout

```typescript
// app/(protected)/settings/layout.tsx
import { SettingsNav } from "./_components/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <SettingsNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
```

### Settings Navigation

```typescript
// app/(protected)/settings/_components/settings-nav.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { name: "Profile", href: "/settings" },
  { name: "Billing", href: "/settings/billing" },
  { name: "Notifications", href: "/settings/notifications" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 lg:flex-col lg:w-48">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm transition-colors",
            pathname === item.href
              ? "bg-muted font-medium"
              : "hover:bg-muted"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
```

### Profile Settings

```typescript
// app/(protected)/settings/page.tsx
import { requireAuth } from "@/adapters/guards/require-auth";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfileSettingsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={session.user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>
            Permanently delete your account and all data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Profile Form

```typescript
// app/(protected)/settings/_components/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export function ProfileForm({ user }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  async function onSubmit(data) {
    const response = await fetch('/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (response.ok) {
      toast.success('Profile updated');
    } else {
      toast.error('Failed to update profile');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Spinner />}
          Save Changes
        </Button>
      </form>
    </Form>
  );
}
```

### Billing Settings

```typescript
// app/(protected)/settings/billing/page.tsx
import { requireAuth } from "@/adapters/guards/require-auth";
import { ManageSubscription } from "./_components/manage-subscription";
import { CurrentPlan } from "./_components/current-plan";

export default async function BillingSettingsPage() {
  const session = await requireAuth();
  // Fetch subscription status

  return (
    <div className="space-y-6">
      <CurrentPlan subscription={subscription} />
      <ManageSubscription hasSubscription={!!subscription} />
    </div>
  );
}
```

## Definition of Done

- [ ] Profile settings work
- [ ] Billing settings work
- [ ] Forms validate
- [ ] Feedback shown
