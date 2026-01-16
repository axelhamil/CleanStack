import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IGetUsageStatsInputDto,
  IGetUsageStatsOutputDto,
} from "@/application/dto/llm/get-usage-stats.dto";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";

const DEFAULT_DAILY_LIMIT = 10.0;
const DEFAULT_MONTHLY_LIMIT = 100.0;

export class GetUsageStatsUseCase
  implements UseCase<IGetUsageStatsInputDto, IGetUsageStatsOutputDto>
{
  constructor(readonly _usageRepository: ILLMUsageRepository) {}

  async execute(
    input: IGetUsageStatsInputDto,
  ): Promise<Result<IGetUsageStatsOutputDto>> {
    const dateValidation = this.validateDates(input.startDate, input.endDate);
    if (dateValidation.isFailure) {
      return Result.fail(dateValidation.getError());
    }

    const { startDate, endDate } = dateValidation.getValue();

    const statsResult = await this._usageRepository.getUsageStats({
      userId: input.userId,
      startDate,
      endDate,
      groupBy: input.groupBy,
    });

    if (statsResult.isFailure) {
      return Result.fail(
        `Failed to fetch usage stats: ${statsResult.getError()}`,
      );
    }

    const budgetResult = await this.fetchBudgetStatus(input.userId);
    if (budgetResult.isFailure) {
      return Result.fail(budgetResult.getError());
    }

    const stats = statsResult.getValue();
    const budgetStatus = budgetResult.getValue();

    return Result.ok({
      totalCost: stats.totalCost,
      totalTokens: stats.totalTokens,
      requestCount: stats.requestCount,
      breakdown: stats.breakdown.map((item) => ({
        period: item.period,
        provider: item.provider,
        model: item.model,
        cost: item.cost,
        tokens: item.tokens,
        requests: item.requests,
      })),
      budgetStatus,
    });
  }

  private validateDates(
    startDateStr?: string,
    endDateStr?: string,
  ): Result<{ startDate?: Date; endDate?: Date }> {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      startDate = new Date(startDateStr);
      if (Number.isNaN(startDate.getTime())) {
        return Result.fail("Invalid start date format");
      }
    }

    if (endDateStr) {
      endDate = new Date(endDateStr);
      if (Number.isNaN(endDate.getTime())) {
        return Result.fail("Invalid end date format");
      }
    }

    if (startDate && endDate && endDate < startDate) {
      return Result.fail("End date cannot be before start date");
    }

    return Result.ok({ startDate, endDate });
  }

  private async fetchBudgetStatus(userId?: string): Promise<
    Result<{
      dailyUsed: number;
      dailyLimit: number;
      monthlyUsed: number;
      monthlyLimit: number;
    }>
  > {
    const dailyCostResult = userId
      ? await this._usageRepository.getTotalCostByUser(userId, "day")
      : await this._usageRepository.getTotalCostGlobal("day");

    if (dailyCostResult.isFailure) {
      return Result.fail(
        `Failed to fetch budget status: ${dailyCostResult.getError()}`,
      );
    }

    const monthlyCostResult = userId
      ? await this._usageRepository.getTotalCostByUser(userId, "month")
      : await this._usageRepository.getTotalCostGlobal("month");

    if (monthlyCostResult.isFailure) {
      return Result.fail(
        `Failed to fetch budget status: ${monthlyCostResult.getError()}`,
      );
    }

    return Result.ok({
      dailyUsed: dailyCostResult.getValue(),
      dailyLimit: DEFAULT_DAILY_LIMIT,
      monthlyUsed: monthlyCostResult.getValue(),
      monthlyLimit: DEFAULT_MONTHLY_LIMIT,
    });
  }
}
