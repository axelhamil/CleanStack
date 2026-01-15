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
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/common/auth-client";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Invalid or missing reset token. Please request a new password reset
          link.
        </p>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-bold underline hover:no-underline"
          >
            Request new link
          </Link>
        </p>
      </div>
    );
  }

  function onSubmit(values: ResetPasswordFormValues) {
    startTransition(async () => {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: token!,
      });

      if (error) {
        toast.error(error.message ?? "Failed to reset password");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset successfully");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    });
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground">
          Your password has been reset successfully. Redirecting to login...
        </p>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-bold underline hover:no-underline"
          >
            Sign in now
          </Link>
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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
              <FormLabel>Confirm New Password</FormLabel>
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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </BrutalistButton>
      </form>
      <p className="text-sm text-muted-foreground text-center mt-4">
        Remember your password?{" "}
        <Link href="/login" className="font-bold underline hover:no-underline">
          Sign in
        </Link>
      </p>
    </Form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <ResetPasswordFormContent />
    </Suspense>
  );
}
