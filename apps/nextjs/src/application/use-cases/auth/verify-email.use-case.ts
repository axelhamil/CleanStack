import type { Result, UseCase } from "@packages/ddd-kit";
import type { IAuthService } from "@/application/ports";

interface VerifyEmailInput {
  userId: string;
}

export class VerifyEmailUseCase implements UseCase<VerifyEmailInput, void> {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: VerifyEmailInput): Promise<Result<void>> {
    return this.authService.verifyEmail(input.userId);
  }
}
