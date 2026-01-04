import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";

interface StatItem {
  value: number;
  label: string;
}

interface StatsCardProps {
  stats: StatItem[];
}

export function StatsCard({ stats }: StatsCardProps) {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Quick Stats</BrutalistCardTitle>
        <BrutalistCardDescription>
          Example dashboard metrics
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 border-3 border-black dark:border-white"
            >
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
