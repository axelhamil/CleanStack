import type { ReactNode } from "react";
import { SettingsNav } from "./_components/settings-nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences.
        </p>
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        <SettingsNav />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
