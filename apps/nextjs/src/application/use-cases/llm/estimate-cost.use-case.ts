import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IEstimateCostInputDto,
  IEstimateCostOutputDto,
} from "@/application/dto/llm/estimate-cost.dto";
import type { ILLMProvider } from "@/application/ports/llm.provider.port";
import type { IModelRouter } from "@/application/ports/model-router.port";

export class EstimateCostUseCase
  implements UseCase<IEstimateCostInputDto, IEstimateCostOutputDto>
{
  constructor(
    readonly _llmProvider: ILLMProvider,
    readonly _modelRouter: IModelRouter,
  ) {}

  async execute(
    _input: IEstimateCostInputDto,
  ): Promise<Result<IEstimateCostOutputDto>> {
    throw new Error("Not implemented");
  }
}
