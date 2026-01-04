import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";

interface SessionCardProps {
  session: {
    id: string;
    expiresAt: Date;
  };
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Session</BrutalistCardTitle>
        <BrutalistCardDescription>
          Current session details
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent className="space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">Session ID</span>
          <p className="font-mono text-xs truncate">{session.id}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Expires</span>
          <p className="font-medium">
            {new Date(session.expiresAt).toLocaleDateString()}
          </p>
        </div>
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
