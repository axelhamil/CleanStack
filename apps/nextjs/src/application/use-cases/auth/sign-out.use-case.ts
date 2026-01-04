import type { Result, UseCase } from "@packages/ddd-kit";
import type { ISignOutInputDto } from "@/application/dto/sign-out.dto";
import type { IAuthProvider } from "@/application/ports/auth.service.port";

export class SignOutUseCase implements UseCase<ISignOutInputDto, void> {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(input: ISignOutInputDto): Promise<Result<void>> {
    return this.authProvider.signOut(input.sessionToken);
  }
}
