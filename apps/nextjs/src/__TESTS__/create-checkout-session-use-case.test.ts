import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { CreateCheckoutSessionUseCase } from "@/application/use-cases/billing/create-checkout-session.use-case";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("CreateCheckoutSessionUseCase", () => {
  let useCase: CreateCheckoutSessionUseCase;
  let mockUserRepo: IUserRepository;
  let mockPaymentProvider: IPaymentProvider;

  const validInput = {
    userId: "user-123",
    priceId: "price_premium",
    baseUrl: "https://example.com",
  };

  const mockUser = User.create({
    email: Email.create("test@example.com" as string).getValue(),
    name: Name.create("John Doe" as string).getValue(),
    image: Option.none(),
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserRepo = {
      findByEmail: vi.fn(),
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

    useCase = new CreateCheckoutSessionUseCase(
      mockUserRepo,
      mockPaymentProvider,
    );
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return checkout URL when user exists", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockPaymentProvider.createCheckoutSession).mockResolvedValue(
          Result.ok({
            sessionId: "cs_123",
            url: "https://checkout.stripe.com/session_123",
          }),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
          url: "https://checkout.stripe.com/session_123",
        });
      });

      it("should call payment provider with correct parameters", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockPaymentProvider.createCheckoutSession).mockResolvedValue(
          Result.ok({
            sessionId: "cs_123",
            url: "https://checkout.stripe.com/session_123",
          }),
        );

        await useCase.execute(validInput);

        expect(mockPaymentProvider.createCheckoutSession).toHaveBeenCalledWith({
          customerEmail: "test@example.com",
          priceId: "price_premium",
          successUrl:
            "https://example.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
          cancelUrl: "https://example.com/pricing",
          metadata: expect.objectContaining({ userId: expect.any(String) }),
        });
      });
    });

    describe("user not found", () => {
      it("should fail when user does not exist", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.none()),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("User not found");
      });

      it("should not call payment provider when user not found", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.none()),
        );

        await useCase.execute(validInput);

        expect(
          mockPaymentProvider.createCheckoutSession,
        ).not.toHaveBeenCalled();
      });
    });

    describe("repository errors", () => {
      it("should fail when repository returns error", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Database connection error");
      });
    });

    describe("payment provider errors", () => {
      it("should fail when payment provider returns error", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockPaymentProvider.createCheckoutSession).mockResolvedValue(
          Result.fail("Stripe checkout error: Invalid price ID"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe(
          "Stripe checkout error: Invalid price ID",
        );
      });

      it("should fail when payment provider is unavailable", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockPaymentProvider.createCheckoutSession).mockResolvedValue(
          Result.fail("Payment service unavailable"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Payment service unavailable");
      });
    });
  });
});
