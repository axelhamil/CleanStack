import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";
import { requireAuth } from "@/adapters/guards/auth.guard";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfileSettingsPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <BrutalistCard>
        <BrutalistCardHeader>
          <BrutalistCardTitle>Profile</BrutalistCardTitle>
          <BrutalistCardDescription>
            Update your profile information.
          </BrutalistCardDescription>
        </BrutalistCardHeader>
        <BrutalistCardContent>
          <ProfileForm user={session.user} />
        </BrutalistCardContent>
      </BrutalistCard>
    </div>
  );
}
