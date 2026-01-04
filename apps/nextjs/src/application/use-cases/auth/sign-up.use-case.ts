import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  AuthSession,
  IAuthService,
  SignUpInput,
} from "@/application/ports";

export class SignUpUseCase implements UseCase<SignUpInput, AuthSession> {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: SignUpInput): Promise<Result<AuthSession>> {
    return this.authService.signUp(input);
  }
}
