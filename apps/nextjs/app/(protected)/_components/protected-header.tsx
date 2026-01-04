"use client";

import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { signOutAction } from "@/adapters/actions/auth.actions";

interface ProtectedHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function ProtectedHeader({ user }: ProtectedHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      const result = await signOutAction();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <header className="border-b-3 border-black dark:border-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold uppercase tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user.name}</span>
          <BrutalistButton
            size="sm"
            variant="outline"
            onClick={handleSignOut}
            disabled={isPending}
          >
            {isPending ? "..." : "Sign Out"}
          </BrutalistButton>
        </div>
      </div>
    </header>
  );
}
