import { match, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IEstimateCostInputDto,
  IEstimateCostOutputDto,
} from "@/application/dto/llm/estimate-cost.dto";
import type {
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { IModelRouter } from "@/application/ports/model-router.port";

export class EstimateCostUseCase
  implements UseCase<IEstimateCostInputDto, IEstimateCostOutputDto>
{
  constructor(
    readonly _llmProvider: ILLMProvider,
    readonly _modelRouter: IModelRouter,
  ) {}

  async execute(
    input: IEstimateCostInputDto,
  ): Promise<Result<IEstimateCostOutputDto>> {
    if (!input.text || input.text.trim().length === 0) {
      return Result.fail("text is required and cannot be empty");
    }

    const tokenResult = await this._llmProvider.estimateTokens(input.text);
    if (tokenResult.isFailure) {
      return Result.fail(`Token estimation failed: ${tokenResult.getError()}`);
    }

    const estimatedTokens = tokenResult.getValue();

    if (input.model) {
      return this.estimateForSpecificModel(input.model, estimatedTokens);
    }

    return this.estimateForAllModels(estimatedTokens);
  }

  private estimateForSpecificModel(
    modelName: string,
    tokens: number,
  ): Result<IEstimateCostOutputDto> {
    const modelOption = this._modelRouter.getModelConfig("", modelName);

    return match(modelOption, {
      Some: (config) => {
        const cost = this.calculateCost(config, tokens);
        return Result.ok({
          estimatedTokens: tokens,
          estimatedCost: {
            min: cost,
            max: cost,
            currency: "USD",
          },
        });
      },
      None: () => Result.fail(`Model '${modelName}' not found`),
    });
  }

  private estimateForAllModels(tokens: number): Result<IEstimateCostOutputDto> {
    const allModels = this._modelRouter.getAllModels();
    const enabledModels = allModels.filter((m) => m.enabled);

    if (enabledModels.length === 0) {
      return Result.fail("No models available for cost estimation");
    }

    const costs = enabledModels.map((model) =>
      this.calculateCost(model, tokens),
    );
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);

    return Result.ok({
      estimatedTokens: tokens,
      estimatedCost: {
        min: minCost,
        max: maxCost,
        currency: "USD",
      },
    });
  }

  private calculateCost(model: IModelConfig, tokens: number): number {
    const inputCost = (tokens / 1000) * model.costPer1kIn;
    const outputCost = (tokens / 1000) * model.costPer1kOut;
    return inputCost + outputCost;
  }
}
