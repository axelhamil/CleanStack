import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetUsageStatsInputDto } from "@/application/dto/llm/get-usage-stats.dto";
import type {
  ILLMUsageRepository,
  IUsageStats,
} from "@/application/ports/llm-usage.repository.port";
import { GetUsageStatsUseCase } from "@/application/use-cases/llm/get-usage-stats.use-case";

describe("GetUsageStatsUseCase", () => {
  let useCase: GetUsageStatsUseCase;
  let mockUsageRepository: ILLMUsageRepository;

  const validInput: IGetUsageStatsInputDto = {
    userId: "user-123",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  };

  const mockUsageStats: IUsageStats = {
    totalCost: 15.5,
    totalTokens: 250000,
    requestCount: 150,
    breakdown: [
      {
        period: "2024-01-01",
        cost: 5.0,
        tokens: 80000,
        requests: 50,
      },
      {
        period: "2024-01-02",
        cost: 10.5,
        tokens: 170000,
        requests: 100,
      },
    ],
  };

  const mockBudgetStatus = {
    dailyUsed: 2.5,
    dailyLimit: 10.0,
    monthlyUsed: 15.5,
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

    useCase = new GetUsageStatsUseCase(mockUsageRepository);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return usage statistics with totals", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.totalCost).toBe(15.5);
        expect(output.totalTokens).toBe(250000);
        expect(output.requestCount).toBe(150);
      });

      it("should return breakdown data", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.breakdown).toHaveLength(2);
        expect(output.breakdown[0]).toHaveProperty("cost");
        expect(output.breakdown[0]).toHaveProperty("tokens");
        expect(output.breakdown[0]).toHaveProperty("requests");
      });

      it("should return budget status", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(mockBudgetStatus.dailyUsed),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.budgetStatus).toHaveProperty("dailyUsed");
        expect(output.budgetStatus).toHaveProperty("dailyLimit");
        expect(output.budgetStatus).toHaveProperty("monthlyUsed");
        expect(output.budgetStatus).toHaveProperty("monthlyLimit");
      });
    });

    describe("filtering", () => {
      it("should filter by userId", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        await useCase.execute({ userId: "user-456" });

        expect(mockUsageRepository.getUsageStats).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: "user-456",
          }),
        );
      });

      it("should filter by date range", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        await useCase.execute({
          startDate: "2024-02-01",
          endDate: "2024-02-28",
        });

        expect(mockUsageRepository.getUsageStats).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(Date),
            endDate: expect.any(Date),
          }),
        );
      });

      it("should return global stats when no userId provided", async () => {
        const globalStats: IUsageStats = {
          totalCost: 100.0,
          totalTokens: 1000000,
          requestCount: 500,
          breakdown: [],
        };
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(globalStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostGlobal).mockResolvedValue(
          Result.ok(10.0),
        );

        const result = await useCase.execute({});

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().totalCost).toBe(100.0);
      });
    });

    describe("groupBy options", () => {
      it("should group by day", async () => {
        const dayStats: IUsageStats = {
          totalCost: 15.5,
          totalTokens: 250000,
          requestCount: 150,
          breakdown: [
            { period: "2024-01-01", cost: 5.0, tokens: 80000, requests: 50 },
            { period: "2024-01-02", cost: 10.5, tokens: 170000, requests: 100 },
          ],
        };
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(dayStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        const result = await useCase.execute({
          ...validInput,
          groupBy: "day",
        });

        expect(result.isSuccess).toBe(true);
        expect(mockUsageRepository.getUsageStats).toHaveBeenCalledWith(
          expect.objectContaining({
            groupBy: "day",
          }),
        );
      });

      it("should group by week", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        await useCase.execute({
          ...validInput,
          groupBy: "week",
        });

        expect(mockUsageRepository.getUsageStats).toHaveBeenCalledWith(
          expect.objectContaining({
            groupBy: "week",
          }),
        );
      });

      it("should group by month", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        await useCase.execute({
          ...validInput,
          groupBy: "month",
        });

        expect(mockUsageRepository.getUsageStats).toHaveBeenCalledWith(
          expect.objectContaining({
            groupBy: "month",
          }),
        );
      });

      it("should group by provider", async () => {
        const providerStats: IUsageStats = {
          totalCost: 15.5,
          totalTokens: 250000,
          requestCount: 150,
          breakdown: [
            { provider: "openai", cost: 10.0, tokens: 150000, requests: 100 },
            { provider: "anthropic", cost: 5.5, tokens: 100000, requests: 50 },
          ],
        };
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(providerStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        const result = await useCase.execute({
          ...validInput,
          groupBy: "provider",
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().breakdown[0]).toHaveProperty("provider");
      });

      it("should group by model", async () => {
        const modelStats: IUsageStats = {
          totalCost: 15.5,
          totalTokens: 250000,
          requestCount: 150,
          breakdown: [
            { model: "gpt-4o-mini", cost: 8.0, tokens: 120000, requests: 80 },
            {
              model: "claude-3-haiku",
              cost: 7.5,
              tokens: 130000,
              requests: 70,
            },
          ],
        };
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(modelStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(2.5),
        );

        const result = await useCase.execute({
          ...validInput,
          groupBy: "model",
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().breakdown[0]).toHaveProperty("model");
      });
    });

    describe("error handling", () => {
      it("should fail when repository returns error", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.fail("Database error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("error");
      });

      it("should fail when budget status fetch fails", async () => {
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(mockUsageStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.fail("Failed to fetch budget"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
      });
    });

    describe("validation", () => {
      it("should fail when start date is invalid", async () => {
        const result = await useCase.execute({
          ...validInput,
          startDate: "invalid-date",
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("date");
      });

      it("should fail when end date is before start date", async () => {
        const result = await useCase.execute({
          startDate: "2024-01-31",
          endDate: "2024-01-01",
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("date");
      });
    });

    describe("edge cases", () => {
      it("should return empty breakdown when no usage", async () => {
        const emptyStats: IUsageStats = {
          totalCost: 0,
          totalTokens: 0,
          requestCount: 0,
          breakdown: [],
        };
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(emptyStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().totalCost).toBe(0);
        expect(result.getValue().breakdown).toHaveLength(0);
      });

      it("should handle very large usage amounts", async () => {
        const largeStats: IUsageStats = {
          totalCost: 999999.99,
          totalTokens: 999999999,
          requestCount: 1000000,
          breakdown: [],
        };
        vi.mocked(mockUsageRepository.getUsageStats).mockResolvedValue(
          Result.ok(largeStats),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(100),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().totalCost).toBe(999999.99);
      });
    });
  });
});
