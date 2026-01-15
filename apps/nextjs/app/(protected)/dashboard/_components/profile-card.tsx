import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/ui/card";

interface ProfileCardProps {
  user: {
    email: string;
    name: string;
    emailVerified: boolean;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="text-sm text-muted-foreground">Email</span>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Name</span>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">Email Verified</span>
          <p className="font-medium">{user.emailVerified ? "Yes" : "No"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
