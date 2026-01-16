import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICheckBudgetInputDto } from "@/application/dto/llm/check-budget.dto";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import { CheckBudgetUseCase } from "@/application/use-cases/llm/check-budget.use-case";

describe("CheckBudgetUseCase", () => {
  let useCase: CheckBudgetUseCase;
  let mockUsageRepository: ILLMUsageRepository;

  const validInput: ICheckBudgetInputDto = {
    userId: "user-123",
    estimatedCost: 0.5,
  };

  const defaultLimits = {
    dailyLimit: 10.0,
    monthlyLimit: 100.0,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUsageRepository = {
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      getTotalCostByUser: vi.fn(),
      getTotalCostGlobal: vi.fn(),
      getUsageStats: vi.fn(),
    };

    useCase = new CheckBudgetUseCase(mockUsageRepository);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return canProceed true when within budget", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(2.0)) // daily
          .mockResolvedValueOnce(Result.ok(50.0)); // monthly

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(true);
      });

      it("should return remaining budget amounts", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(3.0)) // daily
          .mockResolvedValueOnce(Result.ok(40.0)); // monthly

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.remainingBudget.daily).toBe(
          defaultLimits.dailyLimit - 3.0,
        );
        expect(output.remainingBudget.monthly).toBe(
          defaultLimits.monthlyLimit - 40.0,
        );
      });

      it("should return current usage", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(5.0)) // daily
          .mockResolvedValueOnce(Result.ok(75.0)); // monthly

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.usage.dailyUsed).toBe(5.0);
        expect(output.usage.monthlyUsed).toBe(75.0);
      });

      it("should return limits", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(1.0))
          .mockResolvedValueOnce(Result.ok(10.0));

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.limits.dailyLimit).toBe(defaultLimits.dailyLimit);
        expect(output.limits.monthlyLimit).toBe(defaultLimits.monthlyLimit);
      });
    });

    describe("budget exceeded", () => {
      it("should return canProceed false when daily limit exceeded", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(9.8)) // daily - close to limit
          .mockResolvedValueOnce(Result.ok(50.0)); // monthly

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.5, // Would exceed daily
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(false);
      });

      it("should return canProceed false when monthly limit exceeded", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(2.0)) // daily
          .mockResolvedValueOnce(Result.ok(99.8)); // monthly - close to limit

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.5, // Would exceed monthly
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(false);
      });

      it("should return canProceed false when already over daily limit", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(12.0)) // daily - already over
          .mockResolvedValueOnce(Result.ok(50.0)); // monthly

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.01,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(false);
      });

      it("should return canProceed false when already over monthly limit", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(2.0)) // daily
          .mockResolvedValueOnce(Result.ok(110.0)); // monthly - already over

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.01,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(false);
      });
    });

    describe("global budget (no userId)", () => {
      it("should check global budget when no userId provided", async () => {
        vi.mocked(mockUsageRepository.getTotalCostGlobal)
          .mockResolvedValueOnce(Result.ok(50.0)) // daily
          .mockResolvedValueOnce(Result.ok(500.0)); // monthly

        const result = await useCase.execute({
          estimatedCost: 1.0,
        });

        expect(result.isSuccess).toBe(true);
        expect(mockUsageRepository.getTotalCostGlobal).toHaveBeenCalledWith(
          "day",
        );
        expect(mockUsageRepository.getTotalCostGlobal).toHaveBeenCalledWith(
          "month",
        );
      });

      it("should use global limits when no userId", async () => {
        vi.mocked(mockUsageRepository.getTotalCostGlobal)
          .mockResolvedValueOnce(Result.ok(100.0))
          .mockResolvedValueOnce(Result.ok(1000.0));

        const result = await useCase.execute({});

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().limits).toHaveProperty("dailyLimit");
        expect(result.getValue().limits).toHaveProperty("monthlyLimit");
      });
    });

    describe("estimated cost calculation", () => {
      it("should account for estimated cost in canProceed check", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(9.0)) // daily
          .mockResolvedValueOnce(Result.ok(90.0)); // monthly

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.5, // 9 + 0.5 = 9.5 < 10 daily limit
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(true);
      });

      it("should return canProceed true when no estimated cost provided", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(5.0))
          .mockResolvedValueOnce(Result.ok(50.0));

        const result = await useCase.execute({
          userId: "user-123",
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(true);
      });

      it("should handle zero estimated cost", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(9.9))
          .mockResolvedValueOnce(Result.ok(99.9));

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(true);
      });
    });

    describe("error handling", () => {
      it("should fail when daily usage fetch fails", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValueOnce(
          Result.fail("Database error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
      });

      it("should fail when monthly usage fetch fails", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(5.0))
          .mockResolvedValueOnce(Result.fail("Database error"));

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
      });

      it("should fail when global daily fetch fails", async () => {
        vi.mocked(mockUsageRepository.getTotalCostGlobal).mockResolvedValueOnce(
          Result.fail("Database error"),
        );

        const result = await useCase.execute({});

        expect(result.isFailure).toBe(true);
      });
    });

    describe("validation", () => {
      it("should fail when estimatedCost is negative", async () => {
        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: -1.0,
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("cost");
      });
    });

    describe("edge cases", () => {
      it("should handle exactly at daily limit", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(10.0)) // exactly at daily limit
          .mockResolvedValueOnce(Result.ok(50.0));

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.01,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(false);
      });

      it("should handle exactly at monthly limit", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(5.0))
          .mockResolvedValueOnce(Result.ok(100.0)); // exactly at monthly limit

        const result = await useCase.execute({
          userId: "user-123",
          estimatedCost: 0.01,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(false);
      });

      it("should handle zero usage", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(0))
          .mockResolvedValueOnce(Result.ok(0));

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().canProceed).toBe(true);
        expect(result.getValue().remainingBudget.daily).toBe(
          defaultLimits.dailyLimit,
        );
      });

      it("should return negative remaining when over budget", async () => {
        vi.mocked(mockUsageRepository.getTotalCostByUser)
          .mockResolvedValueOnce(Result.ok(15.0)) // over daily
          .mockResolvedValueOnce(Result.ok(120.0)); // over monthly

        const result = await useCase.execute({
          userId: "user-123",
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().remainingBudget.daily).toBeLessThan(0);
        expect(result.getValue().remainingBudget.monthly).toBeLessThan(0);
      });
    });
  });
});
