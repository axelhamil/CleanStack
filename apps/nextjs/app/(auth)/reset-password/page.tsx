import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Set New Password</BrutalistCardTitle>
        <BrutalistCardDescription>
          Enter your new password below
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent>
        <ResetPasswordForm />
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
