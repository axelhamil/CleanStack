"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@packages/ui/components/ui/form";
import { Input } from "@packages/ui/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { signUpAction } from "@/adapters/actions/auth.actions";
import {
  OAuthButtons,
  OAuthDivider,
} from "@/app/(auth)/login/_components/oauth-buttons";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormValues) {
    startTransition(async () => {
      const result = await signUpAction({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Account created successfully");
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <OAuthButtons />
      <OAuthDivider />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="John Doe" {...field} />
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
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <BrutalistButton
          type="submit"
          variant="dark"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </BrutalistButton>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        Already have an account?{" "}
        <Link href="/login" className="font-bold underline hover:no-underline">
          Sign in
        </Link>
      </p>
    </Form>
  );
}
