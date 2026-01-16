import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  ICheckBudgetInputDto,
  ICheckBudgetOutputDto,
} from "@/application/dto/llm/check-budget.dto";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";

export class CheckBudgetUseCase
  implements UseCase<ICheckBudgetInputDto, ICheckBudgetOutputDto>
{
  constructor(readonly _usageRepository: ILLMUsageRepository) {}

  async execute(
    _input: ICheckBudgetInputDto,
  ): Promise<Result<ICheckBudgetOutputDto>> {
    throw new Error("Not implemented");
  }
}
