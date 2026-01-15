"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import { Checkbox } from "@packages/ui/components/ui/checkbox";
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
import { signInAction } from "@/adapters/actions/auth.actions";
import { OAuthButtons, OAuthDivider } from "./oauth-buttons";

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: LoginFormValues) {
    startTransition(async () => {
      const result = await signInAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Signed in successfully");
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
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal cursor-pointer">
                Remember me
              </FormLabel>
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </BrutalistButton>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        Forgot your password?{" "}
        <Link
          href="/forgot-password"
          className="font-bold underline hover:no-underline"
        >
          Reset it
        </Link>
      </p>
      <p className="text-sm text-muted-foreground text-center mt-2">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold underline hover:no-underline"
        >
          Sign up
        </Link>
      </p>
    </Form>
  );
}
