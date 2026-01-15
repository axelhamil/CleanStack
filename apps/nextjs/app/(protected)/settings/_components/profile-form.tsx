"use client";

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
import { useForm, zodResolver } from "@packages/ui/index";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/common/auth-client";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { error } = await authClient.updateUser({
        name: data.name,
      });

      if (error) {
        toast.error(error.message ?? "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
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
              <FormLabel className="font-bold uppercase text-sm tracking-wide">
                Name
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Your name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="font-bold uppercase text-sm tracking-wide"
          >
            Email
          </label>
          <Input
            id="email"
            value={user.email}
            disabled
            className="opacity-60"
          />
          <p className="text-sm text-gray-500">
            Email cannot be changed at this time.
          </p>
        </div>

        <BrutalistButton type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save Changes
        </BrutalistButton>
      </form>
    </Form>
  );
}
