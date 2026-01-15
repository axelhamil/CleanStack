import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Reset Password</BrutalistCardTitle>
        <BrutalistCardDescription>
          Enter your email to receive a password reset link
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent>
        <ForgotPasswordForm />
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
