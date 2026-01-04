import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";
import { LoginForm } from "./_components/login-form";

export default function LoginPage() {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Sign In</BrutalistCardTitle>
        <BrutalistCardDescription>
          Enter your credentials to access your account
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent>
        <LoginForm />
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
