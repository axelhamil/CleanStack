import { createModule } from "@evyweb/ioctopus";
import { StripePaymentProvider } from "@/adapters/payment/stripe-payment.provider";
import { DI_SYMBOLS } from "../types";

export const createBillingModule = () => {
  const billingModule = createModule();

  billingModule
    .bind(DI_SYMBOLS.IPaymentProvider)
    .toClass(StripePaymentProvider);

  return billingModule;
};
