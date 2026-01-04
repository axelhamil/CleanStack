import type { ReactElement, ReactNode } from "react";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { ProtectedHeader } from "./_components/protected-header";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: ReactNode }>): Promise<ReactElement> {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <ProtectedHeader user={session.user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
