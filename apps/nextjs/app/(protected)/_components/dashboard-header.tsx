import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b-3 border-black dark:border-white px-6 bg-white dark:bg-black">
      <MobileNav />
      <div className="flex-1" />
      <UserMenu user={user} />
    </header>
  );
}
