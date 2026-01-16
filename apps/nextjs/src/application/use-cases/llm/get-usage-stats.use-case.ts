import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IGetUsageStatsInputDto,
  IGetUsageStatsOutputDto,
} from "@/application/dto/llm/get-usage-stats.dto";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";

export class GetUsageStatsUseCase
  implements UseCase<IGetUsageStatsInputDto, IGetUsageStatsOutputDto>
{
  constructor(readonly _usageRepository: ILLMUsageRepository) {}

  async execute(
    _input: IGetUsageStatsInputDto,
  ): Promise<Result<IGetUsageStatsOutputDto>> {
    throw new Error("Not implemented");
  }
}
