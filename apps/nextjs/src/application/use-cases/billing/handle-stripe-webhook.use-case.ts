import { Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  IHandleStripeWebhookInputDto,
  IHandleStripeWebhookOutputDto,
} from "@/application/dto/handle-stripe-webhook.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import { Subscription } from "@/domain/billing/subscription.aggregate";
import { PlanId } from "@/domain/billing/value-objects/plan-id.vo";
import { SubscriptionStatus } from "@/domain/billing/value-objects/subscription-status.vo";
import { UserId } from "@/domain/user/user-id";
import { handleSubscriptionUpdate } from "./_shared/subscription.helper";

interface CheckoutSessionData {
  customer: string;
  subscription: string;
  metadata: {
    userId: string;
    priceId?: string;
  };
}

interface InvoiceData {
  subscription: string;
}

interface StripeSubscriptionData {
  id: string;
  customer: string;
  status: string;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
  current_period_start: number;
  current_period_end: number;
}

export class HandleStripeWebhookUseCase
  implements
    UseCase<IHandleStripeWebhookInputDto, IHandleStripeWebhookOutputDto>
{
  constructor(
    private readonly paymentProvider: IPaymentProvider,
    private readonly subscriptionRepo: ISubscriptionRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IHandleStripeWebhookInputDto,
  ): Promise<Result<IHandleStripeWebhookOutputDto>> {
    const eventResult = await this.paymentProvider.verifyWebhook(
      input.payload,
      input.signature,
    );

    if (eventResult.isFailure) {
      return Result.fail(eventResult.getError());
    }

    const event = eventResult.getValue();

    switch (event.type) {
      case "checkout.session.completed":
        return this.handleCheckoutCompleted(event.data as CheckoutSessionData);

      case "invoice.payment_failed":
        return this.handlePaymentFailed(event.data as InvoiceData);

      case "customer.subscription.deleted":
        return this.handleSubscriptionDeleted(
          event.data as StripeSubscriptionData,
        );

      case "customer.subscription.updated":
        return this.handleSubscriptionUpdated(
          event.data as StripeSubscriptionData,
        );

      default:
        return Result.ok({ received: true });
    }
  }

  private async handleCheckoutCompleted(
    data: CheckoutSessionData,
  ): Promise<Result<IHandleStripeWebhookOutputDto>> {
    const userId = data.metadata.userId;
    const customerId = data.customer;
    const subscriptionId = data.subscription;
    const priceId = data.metadata.priceId ?? "pro";

    const planIdResult = PlanId.create(priceId as string);
    if (planIdResult.isFailure) {
      return Result.fail(planIdResult.getError());
    }

    const statusResult = SubscriptionStatus.create("active" as string);
    if (statusResult.isFailure) {
      return Result.fail(statusResult.getError());
    }

    const subscription = Subscription.create({
      userId: UserId.create(new UUID(userId)),
      planId: planIdResult.getValue(),
      status: statusResult.getValue() as SubscriptionStatus,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const saveResult = await this.subscriptionRepo.create(subscription);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(subscription.domainEvents);
    subscription.clearEvents();

    return Result.ok({ received: true });
  }

  private async handlePaymentFailed(
    data: InvoiceData,
  ): Promise<Result<IHandleStripeWebhookOutputDto>> {
    return handleSubscriptionUpdate(
      data.subscription,
      this.subscriptionRepo,
      this.eventDispatcher,
      (subscription) => subscription.markPastDue(),
    );
  }

  private async handleSubscriptionDeleted(
    data: StripeSubscriptionData,
  ): Promise<Result<IHandleStripeWebhookOutputDto>> {
    return handleSubscriptionUpdate(
      data.id,
      this.subscriptionRepo,
      this.eventDispatcher,
      (subscription) => subscription.cancel("Subscription deleted"),
    );
  }

  private async handleSubscriptionUpdated(
    data: StripeSubscriptionData,
  ): Promise<Result<IHandleStripeWebhookOutputDto>> {
    return handleSubscriptionUpdate(
      data.id,
      this.subscriptionRepo,
      this.eventDispatcher,
      (subscription) => {
        const newPriceId = data.items?.data[0]?.price?.id;
        if (newPriceId) {
          const planIdResult = PlanId.create(newPriceId as string);
          if (planIdResult.isSuccess) {
            const currentPlanId = subscription.get("planId").value;
            if (currentPlanId !== newPriceId) {
              subscription.changePlan(planIdResult.getValue());
            }
          }
        }
        return Result.ok(undefined);
      },
    );
  }
}
