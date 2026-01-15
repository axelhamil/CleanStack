import { createModule } from "@evyweb/ioctopus";
import { StripePaymentProvider } from "@/adapters/payment/stripe-payment.provider";
import { CreateCheckoutSessionUseCase } from "@/application/use-cases/billing/create-checkout-session.use-case";
import { DI_SYMBOLS } from "../types";

export const createBillingModule = () => {
  const billingModule = createModule();

  billingModule
    .bind(DI_SYMBOLS.IPaymentProvider)
    .toClass(StripePaymentProvider);

  billingModule
    .bind(DI_SYMBOLS.CreateCheckoutSessionUseCase)
    .toClass(CreateCheckoutSessionUseCase, [
      DI_SYMBOLS.IUserRepository,
      DI_SYMBOLS.IPaymentProvider,
    ]);

  return billingModule;
};
