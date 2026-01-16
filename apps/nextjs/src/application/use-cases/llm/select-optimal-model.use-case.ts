import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ISelectOptimalModelInputDto,
  ISelectOptimalModelOutputDto,
} from "@/application/dto/llm/select-optimal-model.dto";
import type { IModelRouter } from "@/application/ports/model-router.port";

export class SelectOptimalModelUseCase
  implements UseCase<ISelectOptimalModelInputDto, ISelectOptimalModelOutputDto>
{
  constructor(readonly _modelRouter: IModelRouter) {}

  async execute(
    input: ISelectOptimalModelInputDto,
  ): Promise<Result<ISelectOptimalModelOutputDto>> {
    if (input.capabilities.length === 0) {
      return Result.fail("capabilities array cannot be empty");
    }

    const strategy = input.strategy ?? "cheapest";

    const result = this._modelRouter.selectOptimalModel({
      capabilities: input.capabilities,
      maxBudget: input.maxBudget,
      preferredProviders: input.preferredProviders,
      strategy,
    });

    if (result.isFailure) {
      return Result.fail(result.getError());
    }

    const selectedModel = result.getValue();

    return Result.ok({
      provider: selectedModel.provider,
      model: selectedModel.model,
      estimatedCostPer1kTokens: selectedModel.estimatedCostPer1kTokens,
    });
  }
}
