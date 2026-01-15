import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import { CreatePortalSessionUseCase } from "@/application/use-cases/billing/create-portal-session.use-case";
import { Subscription } from "@/domain/billing/subscription.aggregate";
import { PlanId } from "@/domain/billing/value-objects/plan-id.vo";
import { SubscriptionStatus } from "@/domain/billing/value-objects/subscription-status.vo";
import { UserId } from "@/domain/user/user-id";

describe("CreatePortalSessionUseCase", () => {
  let useCase: CreatePortalSessionUseCase;
  let mockSubscriptionRepo: ISubscriptionRepository;
  let mockPaymentProvider: IPaymentProvider;

  const validInput = {
    userId: "user-123",
    returnUrl: "https://example.com/settings/billing",
  };

  const mockSubscription = Subscription.create({
    userId: UserId.create(new UUID<string>("user-123")),
    planId: PlanId.create("pro_monthly" as string).getValue(),
    status: SubscriptionStatus.create("active" as string).getValue(),
    stripeCustomerId: "cus_abc123",
    stripeSubscriptionId: "sub_xyz789",
    currentPeriodStart: new Date("2024-01-01"),
    currentPeriodEnd: new Date("2024-02-01"),
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockSubscriptionRepo = {
      findByUserId: vi.fn(),
      findByStripeSubscriptionId: vi.fn(),
      findByStripeCustomerId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    };

    mockPaymentProvider = {
      createCheckoutSession: vi.fn(),
      createCustomerPortalSession: vi.fn(),
      cancelSubscription: vi.fn(),
      verifyWebhook: vi.fn(),
      getSubscription: vi.fn(),
    };

    useCase = new CreatePortalSessionUseCase(
      mockSubscriptionRepo,
      mockPaymentProvider,
    );
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return portal URL when subscription exists", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.some(mockSubscription)),
        );
        vi.mocked(
          mockPaymentProvider.createCustomerPortalSession,
        ).mockResolvedValue(
          Result.ok({
            sessionId: "bps_123",
            url: "https://billing.stripe.com/portal/session_123",
          }),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
          url: "https://billing.stripe.com/portal/session_123",
        });
      });

      it("should call payment provider with correct customer ID and return URL", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.some(mockSubscription)),
        );
        vi.mocked(
          mockPaymentProvider.createCustomerPortalSession,
        ).mockResolvedValue(
          Result.ok({
            sessionId: "bps_123",
            url: "https://billing.stripe.com/portal/session_123",
          }),
        );

        await useCase.execute(validInput);

        expect(
          mockPaymentProvider.createCustomerPortalSession,
        ).toHaveBeenCalledWith(
          "cus_abc123",
          "https://example.com/settings/billing",
        );
      });

      it("should find subscription by user ID", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.some(mockSubscription)),
        );
        vi.mocked(
          mockPaymentProvider.createCustomerPortalSession,
        ).mockResolvedValue(
          Result.ok({
            sessionId: "bps_123",
            url: "https://billing.stripe.com/portal/session_123",
          }),
        );

        await useCase.execute(validInput);

        expect(mockSubscriptionRepo.findByUserId).toHaveBeenCalledWith(
          "user-123",
        );
      });
    });

    describe("subscription not found", () => {
      it("should fail when user has no subscription", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.none()),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("No subscription found");
      });

      it("should not call payment provider when no subscription", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.none()),
        );

        await useCase.execute(validInput);

        expect(
          mockPaymentProvider.createCustomerPortalSession,
        ).not.toHaveBeenCalled();
      });
    });

    describe("repository errors", () => {
      it("should fail when repository returns error", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Database connection error");
      });

      it("should not call payment provider when repository fails", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        await useCase.execute(validInput);

        expect(
          mockPaymentProvider.createCustomerPortalSession,
        ).not.toHaveBeenCalled();
      });
    });

    describe("payment provider errors", () => {
      it("should fail when payment provider returns error", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.some(mockSubscription)),
        );
        vi.mocked(
          mockPaymentProvider.createCustomerPortalSession,
        ).mockResolvedValue(
          Result.fail("Stripe portal error: Invalid customer"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Stripe portal error: Invalid customer");
      });

      it("should fail when payment provider is unavailable", async () => {
        vi.mocked(mockSubscriptionRepo.findByUserId).mockResolvedValue(
          Result.ok(Option.some(mockSubscription)),
        );
        vi.mocked(
          mockPaymentProvider.createCustomerPortalSession,
        ).mockResolvedValue(Result.fail("Payment service unavailable"));

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Payment service unavailable");
      });
    });
  });
});
