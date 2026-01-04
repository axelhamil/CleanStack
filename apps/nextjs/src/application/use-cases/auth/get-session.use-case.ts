import type { Option, Result, UseCase } from "@packages/ddd-kit";
import type { AuthSession, IAuthService } from "@/application/ports";

interface GetSessionInput {
  sessionToken: string;
}

export class GetSessionUseCase
  implements UseCase<GetSessionInput, Option<AuthSession>>
{
  constructor(private readonly authService: IAuthService) {}

  async execute(input: GetSessionInput): Promise<Result<Option<AuthSession>>> {
    return this.authService.getSession(input.sessionToken);
  }
}
