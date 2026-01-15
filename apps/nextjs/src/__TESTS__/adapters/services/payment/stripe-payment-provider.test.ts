import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockCheckoutSessionsCreate,
  mockBillingPortalSessionsCreate,
  mockSubscriptionsCancel,
  mockSubscriptionsRetrieve,
  mockWebhooksConstructEvent,
  MockStripe,
} = vi.hoisted(() => {
  const mockCheckoutSessionsCreate = vi.fn();
  const mockBillingPortalSessionsCreate = vi.fn();
  const mockSubscriptionsCancel = vi.fn();
  const mockSubscriptionsRetrieve = vi.fn();
  const mockWebhooksConstructEvent = vi.fn();

  class MockStripe {
    checkout = {
      sessions: {
        create: mockCheckoutSessionsCreate,
      },
    };
    billingPortal = {
      sessions: {
        create: mockBillingPortalSessionsCreate,
      },
    };
    subscriptions = {
      cancel: mockSubscriptionsCancel,
      retrieve: mockSubscriptionsRetrieve,
    };
    webhooks = {
      constructEvent: mockWebhooksConstructEvent,
    };
  }

  return {
    mockCheckoutSessionsCreate,
    mockBillingPortalSessionsCreate,
    mockSubscriptionsCancel,
    mockSubscriptionsRetrieve,
    mockWebhooksConstructEvent,
    MockStripe,
  };
});

vi.mock("stripe", () => ({
  default: MockStripe,
}));

import { StripePaymentProvider } from "@/adapters/services/payment/stripe-payment.provider";

const originalEnv = process.env;

describe("StripePaymentProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_WEBHOOK_SECRET: "whsec_test_123",
    };
  });

  describe("constructor", () => {
    it("should throw error when STRIPE_SECRET_KEY is not set", () => {
      const saved = process.env.STRIPE_SECRET_KEY;
      process.env.STRIPE_SECRET_KEY = undefined;

      expect(() => new StripePaymentProvider()).toThrow(
        "STRIPE_SECRET_KEY is not configured",
      );

      process.env.STRIPE_SECRET_KEY = saved;
    });

    it("should initialize successfully with valid config", () => {
      expect(() => new StripePaymentProvider()).not.toThrow();
    });
  });

  describe("createCheckoutSession()", () => {
    it("should create checkout session successfully", async () => {
      const instance = new StripePaymentProvider();

      mockCheckoutSessionsCreate.mockResolvedValue({
        id: "cs_test_123",
        url: "https://checkout.stripe.com/session_123",
      });

      const result = await instance.createCheckoutSession({
        priceId: "price_123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        customerEmail: "test@example.com",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        sessionId: "cs_test_123",
        url: "https://checkout.stripe.com/session_123",
      });
    });

    it("should create checkout session with customer ID", async () => {
      const instance = new StripePaymentProvider();

      mockCheckoutSessionsCreate.mockResolvedValue({
        id: "cs_test_456",
        url: "https://checkout.stripe.com/session_456",
      });

      const result = await instance.createCheckoutSession({
        priceId: "price_123",
        customerId: "cus_123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(result.isSuccess).toBe(true);
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
        mode: "subscription",
        customer: "cus_123",
        customer_email: undefined,
        line_items: [{ price: "price_123", quantity: 1 }],
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        metadata: undefined,
      });
    });

    it("should create checkout session with metadata", async () => {
      const instance = new StripePaymentProvider();

      mockCheckoutSessionsCreate.mockResolvedValue({
        id: "cs_test_789",
        url: "https://checkout.stripe.com/session_789",
      });

      const result = await instance.createCheckoutSession({
        priceId: "price_123",
        customerEmail: "test@example.com",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
        metadata: { userId: "user_123" },
      });

      expect(result.isSuccess).toBe(true);
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith({
        mode: "subscription",
        customer: undefined,
        customer_email: "test@example.com",
        line_items: [{ price: "price_123", quantity: 1 }],
        success_url: "https://example.com/success",
        cancel_url: "https://example.com/cancel",
        metadata: { userId: "user_123" },
      });
    });

    it("should fail when session URL is null", async () => {
      const instance = new StripePaymentProvider();

      mockCheckoutSessionsCreate.mockResolvedValue({
        id: "cs_test_123",
        url: null,
      });

      const result = await instance.createCheckoutSession({
        priceId: "price_123",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("No URL returned");
    });

    it("should fail when Stripe throws error", async () => {
      const instance = new StripePaymentProvider();

      mockCheckoutSessionsCreate.mockRejectedValue(
        new Error("Invalid price ID"),
      );

      const result = await instance.createCheckoutSession({
        priceId: "invalid_price",
        successUrl: "https://example.com/success",
        cancelUrl: "https://example.com/cancel",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Invalid price ID");
    });
  });

  describe("createCustomerPortalSession()", () => {
    it("should create portal session successfully", async () => {
      const instance = new StripePaymentProvider();

      mockBillingPortalSessionsCreate.mockResolvedValue({
        id: "bps_test_123",
        url: "https://billing.stripe.com/session_123",
      });

      const result = await instance.createCustomerPortalSession(
        "cus_123",
        "https://example.com/dashboard",
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        sessionId: "bps_test_123",
        url: "https://billing.stripe.com/session_123",
      });
    });

    it("should fail when Stripe throws error", async () => {
      const instance = new StripePaymentProvider();

      mockBillingPortalSessionsCreate.mockRejectedValue(
        new Error("Customer not found"),
      );

      const result = await instance.createCustomerPortalSession(
        "invalid_cus",
        "https://example.com/dashboard",
      );

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Customer not found");
    });
  });

  describe("cancelSubscription()", () => {
    it("should cancel subscription successfully", async () => {
      const instance = new StripePaymentProvider();

      mockSubscriptionsCancel.mockResolvedValue({
        id: "sub_123",
        status: "canceled",
      });

      const result = await instance.cancelSubscription("sub_123");

      expect(result.isSuccess).toBe(true);
    });

    it("should fail when Stripe throws error", async () => {
      const instance = new StripePaymentProvider();

      mockSubscriptionsCancel.mockRejectedValue(
        new Error("Subscription not found"),
      );

      const result = await instance.cancelSubscription("invalid_sub");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Subscription not found");
    });
  });

  describe("verifyWebhook()", () => {
    it("should verify webhook successfully", async () => {
      const instance = new StripePaymentProvider();

      const mockEvent = {
        type: "customer.subscription.created",
        data: { object: { id: "sub_123" } },
      };
      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const result = await instance.verifyWebhook(
        '{"type":"customer.subscription.created"}',
        "sig_123",
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        type: "customer.subscription.created",
        data: { id: "sub_123" },
      });
    });

    it("should fail when webhook secret is not configured", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "";
      const instance = new StripePaymentProvider();

      const result = await instance.verifyWebhook("payload", "sig_123");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Webhook secret is not configured");
    });

    it("should fail when signature is invalid", async () => {
      const instance = new StripePaymentProvider();

      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const result = await instance.verifyWebhook("payload", "invalid_sig");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Invalid signature");
    });
  });

  describe("getSubscription()", () => {
    it("should retrieve subscription successfully", async () => {
      const instance = new StripePaymentProvider();

      mockSubscriptionsRetrieve.mockResolvedValue({
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        canceled_at: null,
        items: {
          data: [
            {
              price: { id: "price_123" },
              current_period_start: 1700000000,
              current_period_end: 1702678400,
            },
          ],
        },
      });

      const result = await instance.getSubscription("sub_123");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({
        id: "sub_123",
        customerId: "cus_123",
        status: "active",
        priceId: "price_123",
        currentPeriodStart: new Date(1700000000 * 1000),
        currentPeriodEnd: new Date(1702678400 * 1000),
        canceledAt: undefined,
      });
    });

    it("should retrieve subscription with customer object", async () => {
      const instance = new StripePaymentProvider();

      mockSubscriptionsRetrieve.mockResolvedValue({
        id: "sub_123",
        customer: { id: "cus_123", object: "customer" },
        status: "active",
        canceled_at: 1701500000,
        items: {
          data: [
            {
              price: { id: "price_456" },
              current_period_start: 1700000000,
              current_period_end: 1702678400,
            },
          ],
        },
      });

      const result = await instance.getSubscription("sub_123");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().customerId).toBe("cus_123");
      expect(result.getValue().canceledAt).toEqual(new Date(1701500000 * 1000));
    });

    it("should fail when subscription has no items", async () => {
      const instance = new StripePaymentProvider();

      mockSubscriptionsRetrieve.mockResolvedValue({
        id: "sub_123",
        customer: "cus_123",
        status: "active",
        items: {
          data: [],
        },
      });

      const result = await instance.getSubscription("sub_123");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Subscription has no items");
    });

    it("should fail when Stripe throws error", async () => {
      const instance = new StripePaymentProvider();

      mockSubscriptionsRetrieve.mockRejectedValue(
        new Error("Subscription not found"),
      );

      const result = await instance.getSubscription("invalid_sub");

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Subscription not found");
    });
  });
});
