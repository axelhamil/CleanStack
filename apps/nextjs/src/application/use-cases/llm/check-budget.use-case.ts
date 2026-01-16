import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICheckBudgetInputDto,
  ICheckBudgetOutputDto,
} from "@/application/dto/llm/check-budget.dto";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";

const DEFAULT_DAILY_LIMIT = 10.0;
const DEFAULT_MONTHLY_LIMIT = 100.0;

export class CheckBudgetUseCase
  implements UseCase<ICheckBudgetInputDto, ICheckBudgetOutputDto>
{
  constructor(readonly _usageRepository: ILLMUsageRepository) {}

  async execute(
    input: ICheckBudgetInputDto,
  ): Promise<Result<ICheckBudgetOutputDto>> {
    if (input.estimatedCost !== undefined && input.estimatedCost < 0)
      return Result.fail("Estimated cost cannot be negative");

    const usageResult = await this.fetchUsage(input.userId);
    if (usageResult.isFailure) return Result.fail(usageResult.getError());

    const { dailyUsed, monthlyUsed } = usageResult.getValue();
    const estimatedCost = input.estimatedCost ?? 0;

    const dailyLimit = DEFAULT_DAILY_LIMIT;
    const monthlyLimit = DEFAULT_MONTHLY_LIMIT;

    const remainingDaily = dailyLimit - dailyUsed;
    const remainingMonthly = monthlyLimit - monthlyUsed;

    const wouldExceedDaily = dailyUsed + estimatedCost > dailyLimit;
    const wouldExceedMonthly = monthlyUsed + estimatedCost > monthlyLimit;
    const canProceed = !wouldExceedDaily && !wouldExceedMonthly;

    return Result.ok({
      canProceed,
      remainingBudget: {
        daily: remainingDaily,
        monthly: remainingMonthly,
      },
      limits: {
        dailyLimit,
        monthlyLimit,
      },
      usage: {
        dailyUsed,
        monthlyUsed,
      },
    });
  }

  private async fetchUsage(
    userId?: string,
  ): Promise<Result<{ dailyUsed: number; monthlyUsed: number }>> {
    const dailyResult = userId
      ? await this._usageRepository.getTotalCostByUser(userId, "day")
      : await this._usageRepository.getTotalCostGlobal("day");

    if (dailyResult.isFailure)
      return Result.fail(
        `Failed to fetch daily usage: ${dailyResult.getError()}`,
      );

    const monthlyResult = userId
      ? await this._usageRepository.getTotalCostByUser(userId, "month")
      : await this._usageRepository.getTotalCostGlobal("month");

    if (monthlyResult.isFailure)
      return Result.fail(
        `Failed to fetch monthly usage: ${monthlyResult.getError()}`,
      );

    return Result.ok({
      dailyUsed: dailyResult.getValue(),
      monthlyUsed: monthlyResult.getValue(),
    });
  }
}
