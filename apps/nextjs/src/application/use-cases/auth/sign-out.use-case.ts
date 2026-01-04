import type { Result, UseCase } from "@packages/ddd-kit";
import type { IAuthService } from "@/application/ports";

interface SignOutInput {
  sessionToken: string;
}

export class SignOutUseCase implements UseCase<SignOutInput, void> {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: SignOutInput): Promise<Result<void>> {
    return this.authService.signOut(input.sessionToken);
  }
}
