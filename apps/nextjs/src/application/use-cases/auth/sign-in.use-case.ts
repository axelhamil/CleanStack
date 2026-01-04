import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  AuthSession,
  IAuthService,
  SignInInput,
} from "@/application/ports";

export class SignInUseCase implements UseCase<SignInInput, AuthSession> {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: SignInInput): Promise<Result<AuthSession>> {
    return this.authService.signIn(input);
  }
}
