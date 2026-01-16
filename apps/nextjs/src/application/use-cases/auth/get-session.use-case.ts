import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import { mapSessionToDto, mapUserToDto } from "./_shared/auth-dto.helper";

export class GetSessionUseCase
  implements UseCase<Headers, Option<IGetSessionOutputDto>>
{
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(
    headers: Headers,
  ): Promise<Result<Option<IGetSessionOutputDto>>> {
    const sessionResult = await this.authProvider.getSession(headers);
    if (sessionResult.isFailure) return Result.fail(sessionResult.getError());

    return match(sessionResult.getValue(), {
      Some: (authSession) => Result.ok(Option.some(this.toDto(authSession))),
      None: () => Result.ok(Option.none<IGetSessionOutputDto>()),
    });
  }

  private toDto(authSession: AuthSession): IGetSessionOutputDto {
    const { user, session } = authSession;
    return {
      user: mapUserToDto(user),
      session: mapSessionToDto(session),
    };
  }
}
