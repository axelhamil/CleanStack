import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ISignInInputDto,
  ISignInOutputDto,
} from "@/application/dto/sign-in.dto";
import type {
  AuthResponse,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Password } from "@/domain/user/value-objects/password.vo";

export class SignInUseCase
  implements UseCase<ISignInInputDto, ISignInOutputDto>
{
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: ISignInInputDto): Promise<Result<ISignInOutputDto>> {
    const emailResult = Email.create(input.email);
    const passwordResult = Password.create(input.password);

    const combined = Result.combine([emailResult, passwordResult]);
    if (combined.isFailure) return Result.fail(combined.getError());

    const userResult = await this.checkUserExists(emailResult.getValue());
    if (userResult.isFailure) return Result.fail(userResult.getError());

    const user = userResult.getValue();

    const authResult = await this.authProvider.signIn(
      user,
      passwordResult.getValue(),
      input.rememberMe ?? false,
    );
    if (authResult.isFailure) return Result.fail(authResult.getError());

    return Result.ok(this.toDto(authResult.getValue()));
  }

  private async checkUserExists(email: Email): Promise<Result<User>> {
    const userExistsResult = await this.userRepo.findByEmail(email.value);
    if (userExistsResult.isFailure)
      return Result.fail(userExistsResult.getError());

    return match<User, Result<User>>(userExistsResult.getValue(), {
      Some: (user) => Result.ok(user),
      None: () => Result.fail("Email not found"),
    });
  }

  private toDto(authResponse: AuthResponse): ISignInOutputDto {
    const { user, token } = authResponse;
    return {
      user: {
        id: String(user.id.value),
        email: user.get("email").value,
        name: user.get("name").value,
        emailVerified: user.get("emailVerified"),
        image: user.get("image").toNull(),
      },
      token,
    };
  }
}
