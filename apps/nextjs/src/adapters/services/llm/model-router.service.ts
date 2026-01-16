import { Option, Result } from "@packages/ddd-kit";
import type { IModelConfig } from "@/application/ports/llm.provider.port";
import type {
  IModelRouter,
  ISelectedModel,
  ISelectModelParams,
} from "@/application/ports/model-router.port";

export class ModelRouterService implements IModelRouter {
  private models: IModelConfig[];
  private roundRobinIndex = 0;

  constructor(models: IModelConfig[]) {
    this.models = models;
  }

  selectOptimalModel(params: ISelectModelParams): Result<ISelectedModel> {
    let candidates = this.models.filter((m) => m.enabled);

    if (params.capabilities.length > 0) {
      candidates = candidates.filter((m) =>
        params.capabilities.every((cap) => m.capabilities.includes(cap)),
      );
    }

    if (params.maxBudget !== undefined) {
      const budget = params.maxBudget;
      candidates = candidates.filter((m) => m.costPer1kIn <= budget);
      if (candidates.length === 0) {
        return Result.fail(
          "No models available within the specified budget constraints",
        );
      }
    }

    if (params.preferredProviders && params.preferredProviders.length > 0) {
      const providers = params.preferredProviders;
      const preferred = candidates.filter((m) =>
        providers.includes(m.provider),
      );
      if (preferred.length > 0) {
        candidates = preferred;
      }
    }

    if (candidates.length === 0) {
      return Result.fail(
        "No models available matching the specified capabilities",
      );
    }

    let selected: IModelConfig;

    switch (params.strategy) {
      case "cheapest":
        selected = candidates.reduce((cheapest, current) =>
          current.costPer1kIn < cheapest.costPer1kIn ? current : cheapest,
        );
        break;

      case "fastest":
        selected = candidates.reduce((fastest, current) =>
          current.maxTokens < fastest.maxTokens ? current : fastest,
        );
        break;

      case "round-robin": {
        const candidate = candidates[this.roundRobinIndex % candidates.length];
        if (!candidate) {
          return Result.fail("No models available for round-robin selection");
        }
        selected = candidate;
        this.roundRobinIndex++;
        break;
      }

      default:
        return Result.fail(`Unknown strategy: ${params.strategy}`);
    }

    return Result.ok({
      provider: selected.provider,
      model: selected.model,
      estimatedCostPer1kTokens: {
        input: selected.costPer1kIn,
        output: selected.costPer1kOut,
      },
    });
  }

  getModelConfig(provider: string, model: string): Option<IModelConfig> {
    const found = this.models.find(
      (m) => m.provider === provider && m.model === model,
    );
    return Option.fromNullable(found);
  }

  getAllModels(): IModelConfig[] {
    return this.models.map((m) => ({ ...m }));
  }
}
