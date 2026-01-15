import type { ReactElement, ReactNode } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { DashboardHeader } from "./_components/dashboard-header";
import { Sidebar } from "./_components/sidebar";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const session = await requireAuth();

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
