import type { Option, Result } from "@packages/ddd-kit";
import type { IModelConfig } from "./llm.provider.port";

export interface ISelectModelParams {
  capabilities: string[];
  maxBudget?: number;
  preferredProviders?: string[];
  strategy: "cheapest" | "fastest" | "round-robin";
}

export interface ISelectedModel {
  provider: string;
  model: string;
  estimatedCostPer1kTokens: {
    input: number;
    output: number;
  };
}

export interface IModelRouter {
  selectOptimalModel(params: ISelectModelParams): Result<ISelectedModel>;
  getModelConfig(provider: string, model: string): Option<IModelConfig>;
  getAllModels(): IModelConfig[];
}
