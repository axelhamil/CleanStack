import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ISignUpInputDto,
  ISignUpOutputDto,
} from "@/application/dto/sign-up.dto";
import type {
  AuthResponse,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";
import { Password } from "@/domain/user/value-objects/password.vo";

export class SignUpUseCase
  implements UseCase<ISignUpInputDto, ISignUpOutputDto>
{
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: ISignUpInputDto): Promise<Result<ISignUpOutputDto>> {
    const emailResult = Email.create(input.email);
    const nameResult = Name.create(input.name);
    const passwordResult = Password.create(input.password);

    const combined = Result.combine([emailResult, nameResult, passwordResult]);
    if (combined.isFailure) return Result.fail(combined.getError());

    const emailAvailable = await this.checkEmailAvailable(input.email);
    if (emailAvailable.isFailure) return Result.fail(emailAvailable.getError());

    const user = User.create({
      email: emailResult.getValue(),
      name: nameResult.getValue(),
      image: Option.fromNullable(input.image),
    });

    const authResult = await this.authProvider.signUp(
      user,
      passwordResult.getValue(),
    );
    if (authResult.isFailure) return Result.fail(authResult.getError());

    return Result.ok(this.toDto(authResult.getValue()));
  }

  private async checkEmailAvailable(email: string): Promise<Result<void>> {
    const existsResult = await this.userRepo.findByEmail(email);
    if (existsResult.isFailure) return Result.fail(existsResult.getError());

    return match<User, Result<void>>(existsResult.getValue(), {
      Some: () => Result.fail("Email already registered"),
      None: () => Result.ok(),
    });
  }

  private toDto(authResponse: AuthResponse): ISignUpOutputDto {
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
