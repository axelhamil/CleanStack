import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreatePortalSessionInputDto,
  ICreatePortalSessionOutputDto,
} from "@/application/dto/create-portal-session.dto";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import type { Subscription } from "@/domain/billing/subscription.aggregate";

export class CreatePortalSessionUseCase
  implements
    UseCase<ICreatePortalSessionInputDto, ICreatePortalSessionOutputDto>
{
  constructor(
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute(
    input: ICreatePortalSessionInputDto,
  ): Promise<Result<ICreatePortalSessionOutputDto>> {
    const subscriptionResult = await this.findUserSubscription(input.userId);
    if (subscriptionResult.isFailure) {
      return Result.fail(subscriptionResult.getError());
    }

    const subscription = subscriptionResult.getValue();

    return this.createPortalSession(
      subscription.get("stripeCustomerId"),
      input.returnUrl,
    );
  }

  private async findUserSubscription(
    userId: string,
  ): Promise<Result<Subscription>> {
    const result = await this.subscriptionRepo.findByUserId(userId);
    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    return match<Subscription, Result<Subscription>>(result.getValue(), {
      Some: (subscription) => Result.ok(subscription),
      None: () => Result.fail("No subscription found"),
    });
  }

  private async createPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Result<ICreatePortalSessionOutputDto>> {
    const portalResult = await this.paymentProvider.createCustomerPortalSession(
      customerId,
      returnUrl,
    );

    if (portalResult.isFailure) {
      return Result.fail(portalResult.getError());
    }

    const session = portalResult.getValue();
    return Result.ok({ url: session.url });
  }
}
