import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";

interface SessionCardProps {
  session: {
    id: string;
    expiresAt: Date;
  };
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session</CardTitle>
        <CardDescription>Current session details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
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
      </CardContent>
    </Card>
  );
}
