import { match, Result } from "@packages/ddd-kit";
import type { IHandleStripeWebhookOutputDto } from "@/application/dto/handle-stripe-webhook.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import type { Subscription } from "@/domain/billing/subscription.aggregate";

type SubscriptionHandler = (
  subscription: Subscription,
) => Result<void> | Promise<Result<void>>;

export async function handleSubscriptionUpdate(
  stripeSubscriptionId: string,
  subscriptionRepo: ISubscriptionRepository,
  eventDispatcher: IEventDispatcher,
  handler: SubscriptionHandler,
): Promise<Result<IHandleStripeWebhookOutputDto>> {
  const subResult =
    await subscriptionRepo.findByStripeSubscriptionId(stripeSubscriptionId);

  if (subResult.isFailure) {
    return Result.fail(subResult.getError());
  }

  return match<Subscription, Promise<Result<IHandleStripeWebhookOutputDto>>>(
    subResult.getValue(),
    {
      Some: async (subscription) => {
        const handlerResult = await handler(subscription);
        if (handlerResult.isFailure) {
          return Result.ok({ received: true });
        }

        const updateResult = await subscriptionRepo.update(subscription);
        if (updateResult.isFailure) {
          return Result.fail(updateResult.getError());
        }

        await eventDispatcher.dispatchAll(subscription.domainEvents);
        subscription.clearEvents();

        return Result.ok({ received: true });
      },
      None: async () => Result.ok({ received: true }),
    },
  );
}
