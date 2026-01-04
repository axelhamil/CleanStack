import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";
import { RegisterForm } from "./_components/register-form";

export default function RegisterPage() {
  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Create Account</BrutalistCardTitle>
        <BrutalistCardDescription>
          Enter your details to create a new account
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent>
        <RegisterForm />
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
