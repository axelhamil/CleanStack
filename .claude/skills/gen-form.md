---
name: gen-form
description: Generate React Hook Form components with Zod validation and server action integration
---

# Form Generator

Generate production-ready React Hook Form components with Zod validation, shadcn/ui styling, and server action integration.

Reference: `app/(auth)/login/_components/login-form.tsx`

## Architecture Overview

```
Form Component ("use client")
    │
    ├─ Zod schema (validation)
    ├─ React Hook Form (state management)
    ├─ shadcn/ui Form (UI components)
    │
    ▼
Server Action (submit)
    │
    ▼
Toast notification + Router refresh
```

## Input

Form specification:
- Form name and purpose
- Fields with validation rules
- Server action to call
- Success behavior (redirect, toast, callback)

## Output Files

### 1. Basic Form
`app/{route}/_components/{form-name}-form.tsx`

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@packages/ui/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { {actionName}Action } from "@/adapters/actions/{feature}.actions";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface {FormName}FormProps {
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
}

export function {FormName}Form({ initialData, onSuccess }: {FormName}FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      description: initialData?.description ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const result = await {actionName}Action(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Saved successfully");
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name..." {...field} />
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
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional description..." {...field} />
              </FormControl>
              <FormDescription>
                A brief description (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

### 2. Form with Select Field
```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/ui/select";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
] as const;

const formSchema = z.object({
  status: z.enum(["active", "inactive", "pending"]),
});

// In form:
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Status</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3. Form with Textarea
```typescript
import { Textarea } from "@packages/ui/components/ui/textarea";

const formSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters").max(2000),
});

// In form:
<FormField
  control={form.control}
  name="content"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Content</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Write your content here..."
          className="min-h-[120px] resize-none"
          {...field}
        />
      </FormControl>
      <FormDescription>
        {form.watch("content")?.length ?? 0}/2000 characters
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 4. Form with Checkbox
```typescript
import { Checkbox } from "@packages/ui/components/ui/checkbox";

const formSchema = z.object({
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
  notifications: z.boolean().default(false),
});

// In form:
<FormField
  control={form.control}
  name="terms"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Accept terms and conditions</FormLabel>
        <FormDescription>
          You agree to our Terms of Service and Privacy Policy.
        </FormDescription>
      </div>
    </FormItem>
  )}
/>
```

### 5. Form with Radio Group
```typescript
import { RadioGroup, RadioGroupItem } from "@packages/ui/components/ui/radio-group";

const planOptions = [
  { value: "free", label: "Free", description: "Basic features" },
  { value: "pro", label: "Pro", description: "Advanced features" },
  { value: "enterprise", label: "Enterprise", description: "Full access" },
] as const;

const formSchema = z.object({
  plan: z.enum(["free", "pro", "enterprise"]),
});

// In form:
<FormField
  control={form.control}
  name="plan"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Select Plan</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
          {planOptions.map((option) => (
            <FormItem
              key={option.value}
              className="flex items-center space-x-3 space-y-0"
            >
              <FormControl>
                <RadioGroupItem value={option.value} />
              </FormControl>
              <FormLabel className="font-normal">
                {option.label}
                <span className="text-muted-foreground text-sm ml-2">
                  - {option.description}
                </span>
              </FormLabel>
            </FormItem>
          ))}
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 6. Form with Date Picker
```typescript
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@packages/ui/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@packages/ui/components/ui/popover";
import { cn } from "@packages/ui/lib/utils";

const formSchema = z.object({
  dueDate: z.date({
    required_error: "Due date is required",
  }),
});

// In form:
<FormField
  control={form.control}
  name="dueDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Due Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 7. Form with File Upload
```typescript
import { UploadIcon } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .jpg, .png, and .webp formats are supported"
    )
    .optional(),
});

// In form:
<FormField
  control={form.control}
  name="file"
  render={({ field: { onChange, value, ...field } }) => (
    <FormItem>
      <FormLabel>Upload Image</FormLabel>
      <FormControl>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept={ACCEPTED_FILE_TYPES.join(",")}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
            {...field}
          />
          {value && (
            <span className="text-sm text-muted-foreground">
              {value.name}
            </span>
          )}
        </div>
      </FormControl>
      <FormDescription>
        Max 5MB. Supported formats: JPG, PNG, WebP
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 8. Multi-Step Form
```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@packages/ui/components/ui/button";
import { Progress } from "@packages/ui/components/ui/progress";

const step1Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const step2Schema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
});

const fullSchema = step1Schema.merge(step2Schema);
type FullFormValues = z.infer<typeof fullSchema>;

export function MultiStepForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 2;

  const form = useForm<FullFormValues>({
    resolver: zodResolver(step === 1 ? step1Schema : fullSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      company: "",
    },
  });

  async function onNext() {
    const isValid = await form.trigger(
      step === 1 ? ["email", "password"] : ["name"]
    );
    if (isValid) setStep(step + 1);
  }

  function onBack() {
    setStep(step - 1);
  }

  function onSubmit(values: FullFormValues) {
    // Final submit
    console.log(values);
  }

  return (
    <div className="space-y-6">
      <Progress value={(step / totalSteps) * 100} />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <>
            {/* Step 1 fields */}
          </>
        )}

        {step === 2 && (
          <>
            {/* Step 2 fields */}
          </>
        )}

        <div className="flex gap-4">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          {step < totalSteps ? (
            <Button type="button" onClick={onNext}>
              Next
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </div>
      </form>
    </div>
  );
}
```

## Zod Validation Patterns

```typescript
// Common validations
const schema = z.object({
  // String validations
  required: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  url: z.string().url("Invalid URL"),
  password: z.string().min(8, "At least 8 characters"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),

  // Number validations
  age: z.coerce.number().min(18).max(120),
  price: z.coerce.number().positive("Must be positive"),

  // Boolean
  terms: z.boolean().refine((v) => v, "Must accept terms"),

  // Enum
  status: z.enum(["active", "inactive"]),

  // Optional
  bio: z.string().max(500).optional(),

  // Optional with default
  notifications: z.boolean().default(true),

  // Nullable
  deletedAt: z.date().nullable(),

  // Date
  birthDate: z.coerce.date().max(new Date(), "Cannot be in future"),

  // Array
  tags: z.array(z.string()).min(1, "At least one tag"),

  // Refinements
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

## File Structure

```
app/{route}/_components/
├── {feature}-form.tsx           # Main form component
├── {feature}-form-fields.tsx    # Complex field groups (optional)
└── {feature}-form-actions.tsx   # Form action buttons (optional)
```

## Conventions

1. **"use client"** - All forms are client components
2. **Zod schema** - Define at top of file
3. **React Hook Form** - Use `zodResolver` adapter
4. **useTransition** - For pending states
5. **toast.error/success** - For feedback
6. **router.refresh()** - After successful submit
7. **Controlled components** - Via FormField render prop
8. **Accessibility** - Use FormLabel, FormDescription, FormMessage

## Example Usage

```
/gen-form CreateBookmark:
- Fields: title (required), url (required, URL), description (optional, max 500)
- Action: createBookmarkAction
- On success: toast + redirect to /bookmarks
```

```
/gen-form UpdateProfile:
- Fields: name (required), email (readonly), bio (optional textarea), avatar (file upload)
- Action: updateProfileAction
- On success: toast + refresh
```

```
/gen-form SubscriptionPlan:
- Fields: plan (radio group: free/pro/enterprise), billingCycle (select: monthly/yearly)
- Action: updateSubscriptionAction
- On success: redirect to /settings/billing
```
