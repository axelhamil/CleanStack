"use client";

import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@packages/ui/components/ui/sheet";
import { cn } from "@packages/ui/index";
import {
  CreditCard,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Team", href: "/team", icon: Users },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="lg:hidden">
        <BrutalistButton variant="outline" size="sm" className="h-10 w-10 p-0">
          <Menu className="h-5 w-5" strokeWidth={2.5} />
          <span className="sr-only">Toggle menu</span>
        </BrutalistButton>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 p-0 border-r-3 border-black dark:border-white rounded-none"
      >
        <div className="flex h-16 items-center border-b-3 border-black dark:border-white px-6">
          <Link
            href="/dashboard"
            className="font-black text-xl uppercase tracking-tight"
            onClick={() => setOpen(false)}
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
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
