import { match, Result, type UseCase } from "@packages/ddd-kit";
import type { ISignOutOutputDto } from "@/application/dto/sign-out.dto";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import { mapSessionToDto, mapUserToDto } from "./_shared/auth-dto.helper";

export class SignOutUseCase implements UseCase<Headers, ISignOutOutputDto> {
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(headers: Headers): Promise<Result<ISignOutOutputDto>> {
    const sessionResult = await this.authProvider.getSession(headers);
    if (sessionResult.isFailure) return Result.fail(sessionResult.getError());

    const authSessionResult = match<AuthSession, Result<AuthSession>>(
      sessionResult.getValue(),
      {
        Some: (session) => Result.ok(session),
        None: () => Result.fail("No active session found"),
      },
    );

    if (authSessionResult.isFailure) {
      return Result.fail(authSessionResult.getError());
    }

    const signOutResult = await this.authProvider.signOut(headers);
    if (signOutResult.isFailure) {
      return Result.fail(signOutResult.getError());
    }

    return Result.ok(this.toDto(authSessionResult.getValue()));
  }

  private toDto(authSession: AuthSession): ISignOutOutputDto {
    const { user, session } = authSession;
    return {
      user: mapUserToDto(user),
      session: mapSessionToDto(session),
    };
  }
}
