import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";

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
      user: {
        id: String(user.id.value),
        email: user.get("email").value,
        name: user.get("name").value,
        emailVerified: user.get("emailVerified"),
        image: user.get("image").toNull(),
      },
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
      },
    };
  }
}
