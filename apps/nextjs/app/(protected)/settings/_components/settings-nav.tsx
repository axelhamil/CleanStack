"use client";

import { cn } from "@packages/ui/index";
import { CreditCard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Profile", href: "/settings", icon: User },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 lg:flex-col lg:w-48">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/settings" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 font-bold uppercase text-sm tracking-wide transition-all border-3",
              isActive
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                : "bg-white text-black dark:bg-black dark:text-white border-transparent hover:border-black dark:hover:border-white",
            )}
          >
            <item.icon className="h-4 w-4" strokeWidth={2.5} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
