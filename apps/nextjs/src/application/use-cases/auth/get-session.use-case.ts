import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetSessionInputDto,
  IGetSessionOutputDto,
} from "@/application/dto/get-session.dto";
import type {
  IAuthProvider,
  Session,
} from "@/application/ports/auth.service.port";
import type { User } from "@/domain/user/user.aggregate";

export class GetSessionUseCase
  implements UseCase<IGetSessionInputDto, Option<IGetSessionOutputDto>>
{
  constructor(private readonly authProvider: IAuthProvider) {}

  async execute(
    input: IGetSessionInputDto,
  ): Promise<Result<Option<IGetSessionOutputDto>>> {
    const sessionResult = await this.authProvider.getSession(
      input.sessionToken,
    );
    if (sessionResult.isFailure) return Result.fail(sessionResult.getError());

    return match(sessionResult.getValue(), {
      Some: ({ user, session }) =>
        Result.ok(Option.some(this.toDto(user, session))),
      None: () => Result.ok(Option.none<IGetSessionOutputDto>()),
    });
  }

  private toDto(user: User, session: Session): IGetSessionOutputDto {
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
