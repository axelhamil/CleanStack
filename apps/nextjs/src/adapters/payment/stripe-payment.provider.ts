import { Result } from "@packages/ddd-kit";
import Stripe from "stripe";
import type {
  CheckoutSession,
  CreateCheckoutParams,
  IPaymentProvider,
  PortalSession,
  StripeSubscription,
  WebhookEvent,
} from "@/application/ports/payment.provider.port";

export class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
    });

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  }

  async createCheckoutSession(
    params: CreateCheckoutParams,
  ): Promise<Result<CheckoutSession>> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        mode: "subscription",
        customer: params.customerId,
        customer_email: params.customerId ? undefined : params.customerEmail,
        line_items: [{ price: params.priceId, quantity: 1 }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata,
      });

      if (!session.url) {
        return Result.fail(
          "Failed to create checkout session: No URL returned",
        );
      }

      return Result.ok({ sessionId: session.id, url: session.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(`Stripe checkout error: ${message}`);
    }
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<Result<PortalSession>> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return Result.ok({ sessionId: session.id, url: session.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(`Stripe portal error: ${message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Result<void>> {
    try {
      await this.stripe.subscriptions.cancel(subscriptionId);
      return Result.ok();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(`Stripe cancel error: ${message}`);
    }
  }

  async verifyWebhook(
    payload: string,
    signature: string,
  ): Promise<Result<WebhookEvent>> {
    try {
      if (!this.webhookSecret) {
        return Result.fail("Webhook secret is not configured");
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );

      return Result.ok({ type: event.type, data: event.data.object });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(`Webhook verification error: ${message}`);
    }
  }

  async getSubscription(
    subscriptionId: string,
  ): Promise<Result<StripeSubscription>> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);

      const firstItem = subscription.items.data[0];
      if (!firstItem) {
        return Result.fail("Subscription has no items");
      }

      const priceId = firstItem.price.id;

      return Result.ok({
        id: subscription.id,
        customerId:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        status: subscription.status,
        priceId,
        currentPeriodStart: new Date(firstItem.current_period_start * 1000),
        currentPeriodEnd: new Date(firstItem.current_period_end * 1000),
        canceledAt: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000)
          : undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.fail(`Stripe subscription error: ${message}`);
    }
  }
}
