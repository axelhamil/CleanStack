import { requireAuth } from "@/adapters/guards/auth.guard";
import { DashboardHeader } from "./_components/dashboard-header";
import { ProfileCard } from "./_components/profile-card";
import { SessionCard } from "./_components/session-card";
import { StatsCard } from "./_components/stats-card";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-8">
      <DashboardHeader userName={session.user.name} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProfileCard user={session.user} />
        <SessionCard session={session.session} />
        <StatsCard
          stats={[
            { value: 42, label: "Projects" },
            { value: 128, label: "Tasks" },
          ]}
        />
      </div>
    </div>
  );
}
