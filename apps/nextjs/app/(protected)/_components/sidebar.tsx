"use client";

import { cn } from "@packages/ui/index";
import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Prompts", href: "/admin/prompts", icon: FileText },
  { name: "Usage", href: "/admin/usage", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r-3 border-black dark:border-white bg-white dark:bg-black lg:block">
      <div className="flex h-16 items-center border-b-3 border-black dark:border-white px-6">
        <Link
          href="/dashboard"
          className="font-black text-xl uppercase tracking-tight"
        >
          AppName
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 font-bold uppercase text-sm tracking-wide transition-all border-3",
                isActive
                  ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                  : "bg-white text-black dark:bg-black dark:text-white border-transparent hover:border-black dark:hover:border-white",
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={2.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
