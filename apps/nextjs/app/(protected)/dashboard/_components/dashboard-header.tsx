interface DashboardHeaderProps {
  userName: string;
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold uppercase tracking-tight">
        Welcome back, {userName}
      </h1>
      <p className="text-muted-foreground mt-2">
        This is a protected page. Only authenticated users can see this.
      </p>
    </div>
  );
}
