import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";

interface ProfileCardProps {
  user: {
    email: string;
    name: string;
    emailVerified: boolean;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Profile</BrutalistCardTitle>
        <BrutalistCardDescription>
          Your account information
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent className="space-y-2">
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
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
