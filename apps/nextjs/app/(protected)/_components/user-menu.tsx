"use client";

import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@packages/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/ui/dropdown-menu";
import { CreditCard, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { signOutAction } from "@/adapters/actions/auth.actions";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
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

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BrutalistButton
          variant="outline"
          size="sm"
          className="relative h-10 w-10 rounded-none p-0"
        >
          <Avatar className="h-9 w-9 rounded-none border-2 border-black dark:border-white">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="rounded-none bg-yellow-300 dark:bg-yellow-500 text-black font-bold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </BrutalistButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-3 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
      >
        <div className="flex items-center gap-2 p-3 border-b-2 border-black dark:border-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuItem asChild className="rounded-none cursor-pointer">
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-none cursor-pointer">
          <Link href="/settings/billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-black dark:bg-white" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="rounded-none cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isPending ? "Signing out..." : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
