import { match, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  ICreateCheckoutSessionInputDto,
  ICreateCheckoutSessionOutputDto,
} from "@/application/dto/create-checkout-session.dto";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { User } from "@/domain/user/user.aggregate";
import { UserId } from "@/domain/user/user-id";

export class CreateCheckoutSessionUseCase
  implements
    UseCase<ICreateCheckoutSessionInputDto, ICreateCheckoutSessionOutputDto>
{
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: ICreateCheckoutSessionInputDto,
  ): Promise<Result<ICreateCheckoutSessionOutputDto>> {
    const userResult = await this.getUser(input.userId);
    if (userResult.isFailure) return Result.fail(userResult.getError());

    const user = userResult.getValue();

    const sessionResult = await this.paymentProvider.createCheckoutSession({
      customerEmail: user.get("email").value,
      priceId: input.priceId,
      successUrl: `${input.baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${input.baseUrl}/pricing`,
      metadata: { userId: String(user.id.value) },
    });

    if (sessionResult.isFailure) return Result.fail(sessionResult.getError());

    return Result.ok({ url: sessionResult.getValue().url });
  }

  private async getUser(userIdString: string): Promise<Result<User>> {
    const userId = UserId.create(new UUID(userIdString));
    const userResult = await this.userRepo.findById(userId);

    if (userResult.isFailure) return Result.fail(userResult.getError());

    return match<User, Result<User>>(userResult.getValue(), {
      Some: (user) => Result.ok(user),
      None: () => Result.fail("User not found"),
    });
  }
}
