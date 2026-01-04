import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type { IVerifyEmailInputDto } from "@/application/dto/verify-email.dto";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";

export class VerifyEmailUseCase implements UseCase<IVerifyEmailInputDto, void> {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly authProvider: IAuthProvider,
  ) {}

  async execute(input: IVerifyEmailInputDto): Promise<Result<void>> {
    const userId = UserId.create(new UUID(input.userId));

    const userResult = await this.findUser(userId);
    if (userResult.isFailure) return Result.fail(userResult.getError());

    const user = userResult.getValue();

    const verifyResult = user.verify();
    if (verifyResult.isFailure) {
      return Result.fail(verifyResult.getError());
    }

    const updateResult = await this.userRepo.update(user);
    if (updateResult.isFailure) return Result.fail(updateResult.getError());

    await this.authProvider.verifyEmail(input.userId);

    return Result.ok();
  }

  private async findUser(userId: UserId): Promise<Result<User>> {
    const userResult = await this.userRepo.findById(userId);
    if (userResult.isFailure) return Result.fail(userResult.getError());

    return match<User, Result<User>>(userResult.getValue(), {
      Some: (user) => Result.ok(user),
      None: () => Result.fail("User not found"),
    });
  }
}
