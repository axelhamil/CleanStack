import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  IPaymentProvider,
  WebhookEvent,
} from "@/application/ports/payment.provider.port";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import { HandleStripeWebhookUseCase } from "@/application/use-cases/billing/handle-stripe-webhook.use-case";
import { Subscription } from "@/domain/billing/subscription.aggregate";
import { PlanId } from "@/domain/billing/value-objects/plan-id.vo";
import { SubscriptionStatus } from "@/domain/billing/value-objects/subscription-status.vo";
import { UserId } from "@/domain/user/user-id";

describe("HandleStripeWebhookUseCase", () => {
  let useCase: HandleStripeWebhookUseCase;
  let mockPaymentProvider: IPaymentProvider;
  let mockSubscriptionRepo: ISubscriptionRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput = {
    payload: '{"type": "checkout.session.completed"}',
    signature: "whsec_123",
  };

  const mockSubscription = Subscription.create({
    userId: UserId.create(new UUID("user-123")),
    planId: PlanId.create("pro" as string).getValue(),
    status: SubscriptionStatus.create(
      "active" as string,
    ).getValue() as SubscriptionStatus,
    stripeCustomerId: "cus_123",
    stripeSubscriptionId: "sub_123",
    currentPeriodStart: new Date("2024-01-01"),
    currentPeriodEnd: new Date("2024-02-01"),
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockPaymentProvider = {
      createCheckoutSession: vi.fn(),
      createCustomerPortalSession: vi.fn(),
      cancelSubscription: vi.fn(),
      verifyWebhook: vi.fn(),
      getSubscription: vi.fn(),
    };

    mockSubscriptionRepo = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByStripeSubscriptionId: vi.fn(),
      findByStripeCustomerId: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    };

    mockEventDispatcher = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
      isSubscribed: vi.fn(),
      getHandlerCount: vi.fn(),
      clearHandlers: vi.fn(),
    };

    useCase = new HandleStripeWebhookUseCase(
      mockPaymentProvider,
      mockSubscriptionRepo,
      mockEventDispatcher,
    );
  });

  describe("signature verification", () => {
    it("should fail when signature verification fails", async () => {
      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.fail("Invalid signature"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Invalid signature");
    });
  });

  describe("checkout.session.completed", () => {
    it("should create subscription when checkout completes", async () => {
      const event: WebhookEvent = {
        type: "checkout.session.completed",
        data: {
          customer: "cus_new",
          subscription: "sub_new",
          metadata: {
            userId: "user-456",
            priceId: "price_pro",
          },
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(mockSubscriptionRepo.create).mockResolvedValue(
        Result.ok(mockSubscription),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ received: true });
      expect(mockSubscriptionRepo.create).toHaveBeenCalledOnce();
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
    });

    it("should fail when subscription creation fails", async () => {
      const event: WebhookEvent = {
        type: "checkout.session.completed",
        data: {
          customer: "cus_new",
          subscription: "sub_new",
          metadata: {
            userId: "user-456",
          },
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(mockSubscriptionRepo.create).mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database error");
    });
  });

  describe("invoice.payment_failed", () => {
    it("should mark subscription as past due when payment fails", async () => {
      const event: WebhookEvent = {
        type: "invoice.payment_failed",
        data: {
          subscription: "sub_123",
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(
        mockSubscriptionRepo.findByStripeSubscriptionId,
      ).mockResolvedValue(Result.ok(Option.some(mockSubscription)));
      vi.mocked(mockSubscriptionRepo.update).mockResolvedValue(
        Result.ok(mockSubscription),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ received: true });
      expect(mockSubscriptionRepo.update).toHaveBeenCalledOnce();
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
    });

    it("should succeed when subscription not found", async () => {
      const event: WebhookEvent = {
        type: "invoice.payment_failed",
        data: {
          subscription: "sub_unknown",
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(
        mockSubscriptionRepo.findByStripeSubscriptionId,
      ).mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockSubscriptionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.deleted", () => {
    it("should cancel subscription when deleted", async () => {
      const event: WebhookEvent = {
        type: "customer.subscription.deleted",
        data: {
          id: "sub_123",
          customer: "cus_123",
          status: "canceled",
          items: { data: [{ price: { id: "price_pro" } }] },
          current_period_start: Date.now() / 1000,
          current_period_end: Date.now() / 1000 + 86400,
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(
        mockSubscriptionRepo.findByStripeSubscriptionId,
      ).mockResolvedValue(Result.ok(Option.some(mockSubscription)));
      vi.mocked(mockSubscriptionRepo.update).mockResolvedValue(
        Result.ok(mockSubscription),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ received: true });
      expect(mockSubscriptionRepo.update).toHaveBeenCalledOnce();
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
    });

    it("should succeed when subscription not found", async () => {
      const event: WebhookEvent = {
        type: "customer.subscription.deleted",
        data: {
          id: "sub_unknown",
          customer: "cus_123",
          status: "canceled",
          items: { data: [] },
          current_period_start: Date.now() / 1000,
          current_period_end: Date.now() / 1000 + 86400,
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(
        mockSubscriptionRepo.findByStripeSubscriptionId,
      ).mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockSubscriptionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("customer.subscription.updated", () => {
    it("should update subscription plan when changed", async () => {
      const event: WebhookEvent = {
        type: "customer.subscription.updated",
        data: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
          items: { data: [{ price: { id: "price_enterprise" } }] },
          current_period_start: Date.now() / 1000,
          current_period_end: Date.now() / 1000 + 86400,
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(
        mockSubscriptionRepo.findByStripeSubscriptionId,
      ).mockResolvedValue(Result.ok(Option.some(mockSubscription)));
      vi.mocked(mockSubscriptionRepo.update).mockResolvedValue(
        Result.ok(mockSubscription),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ received: true });
      expect(mockSubscriptionRepo.update).toHaveBeenCalledOnce();
    });

    it("should succeed when subscription not found", async () => {
      const event: WebhookEvent = {
        type: "customer.subscription.updated",
        data: {
          id: "sub_unknown",
          customer: "cus_123",
          status: "active",
          items: { data: [] },
          current_period_start: Date.now() / 1000,
          current_period_end: Date.now() / 1000 + 86400,
        },
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );
      vi.mocked(
        mockSubscriptionRepo.findByStripeSubscriptionId,
      ).mockResolvedValue(Result.ok(Option.none()));

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(mockSubscriptionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("unknown events", () => {
    it("should succeed for unknown event types", async () => {
      const event: WebhookEvent = {
        type: "unknown.event",
        data: {},
      };

      vi.mocked(mockPaymentProvider.verifyWebhook).mockResolvedValue(
        Result.ok(event),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toEqual({ received: true });
      expect(mockSubscriptionRepo.create).not.toHaveBeenCalled();
      expect(mockSubscriptionRepo.update).not.toHaveBeenCalled();
    });
  });
});
