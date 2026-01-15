import { createModule } from "@evyweb/ioctopus";
import { StripePaymentProvider } from "@/adapters/payment/stripe-payment.provider";
import { InMemorySubscriptionRepository } from "@/adapters/repositories/subscription.repository";
import { CreateCheckoutSessionUseCase } from "@/application/use-cases/billing/create-checkout-session.use-case";
import { CreatePortalSessionUseCase } from "@/application/use-cases/billing/create-portal-session.use-case";
import { HandleStripeWebhookUseCase } from "@/application/use-cases/billing/handle-stripe-webhook.use-case";
import { DI_SYMBOLS } from "../types";

export const createBillingModule = () => {
  const billingModule = createModule();

  billingModule
    .bind(DI_SYMBOLS.IPaymentProvider)
    .toClass(StripePaymentProvider);

  billingModule
    .bind(DI_SYMBOLS.ISubscriptionRepository)
    .toClass(InMemorySubscriptionRepository);

  billingModule
    .bind(DI_SYMBOLS.CreateCheckoutSessionUseCase)
    .toClass(CreateCheckoutSessionUseCase, [
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IPaymentProvider,
    ]);

  billingModule
    .bind(DI_SYMBOLS.CreatePortalSessionUseCase)
    .toClass(CreatePortalSessionUseCase, [
      DI_SYMBOLS.ISubscriptionRepository,
      DI_SYMBOLS.IPaymentProvider,
    ]);

  billingModule
    .bind(DI_SYMBOLS.HandleStripeWebhookUseCase)
    .toClass(HandleStripeWebhookUseCase, [
      DI_SYMBOLS.IPaymentProvider,
      DI_SYMBOLS.ISubscriptionRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  return billingModule;
};
