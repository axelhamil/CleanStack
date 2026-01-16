import type { IModelConfig } from "@/application/ports/llm.provider.port";

export const DEFAULT_MODEL_CONFIGS: IModelConfig[] = [
  {
    provider: "openai",
    model: "gpt-4o",
    costPer1kIn: 0.0025,
    costPer1kOut: 0.01,
    capabilities: ["chat", "function-calling", "vision"],
    maxTokens: 128000,
    enabled: true,
  },
  {
    provider: "openai",
    model: "gpt-4o-mini",
    costPer1kIn: 0.00015,
    costPer1kOut: 0.0006,
    capabilities: ["chat", "function-calling", "vision"],
    maxTokens: 128000,
    enabled: true,
  },
  {
    provider: "openai",
    model: "gpt-4-turbo",
    costPer1kIn: 0.01,
    costPer1kOut: 0.03,
    capabilities: ["chat", "function-calling", "vision"],
    maxTokens: 128000,
    enabled: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    costPer1kIn: 0.003,
    costPer1kOut: 0.015,
    capabilities: ["chat", "vision"],
    maxTokens: 200000,
    enabled: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-5-haiku-20241022",
    costPer1kIn: 0.001,
    costPer1kOut: 0.005,
    capabilities: ["chat", "vision"],
    maxTokens: 200000,
    enabled: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-opus-20240229",
    costPer1kIn: 0.015,
    costPer1kOut: 0.075,
    capabilities: ["chat", "vision"],
    maxTokens: 200000,
    enabled: true,
  },
  {
    provider: "google",
    model: "gemini-1.5-pro",
    costPer1kIn: 0.00125,
    costPer1kOut: 0.005,
    capabilities: ["chat", "vision"],
    maxTokens: 2097152,
    enabled: true,
  },
  {
    provider: "google",
    model: "gemini-1.5-flash",
    costPer1kIn: 0.000075,
    costPer1kOut: 0.0003,
    capabilities: ["chat", "vision"],
    maxTokens: 1048576,
    enabled: true,
  },
];

export interface IBudgetConfig {
  dailyBudget: number;
  monthlyBudget: number;
  perUserDailyBudget: number;
  perUserMonthlyBudget: number;
  warningThreshold: number;
  currency: string;
}

export const DEFAULT_BUDGET_CONFIG: IBudgetConfig = {
  dailyBudget: 100,
  monthlyBudget: 2000,
  perUserDailyBudget: 10,
  perUserMonthlyBudget: 100,
  warningThreshold: 0.8,
  currency: "USD",
};

export interface ILLMConfig {
  models: IModelConfig[];
  budget: IBudgetConfig;
  defaultProvider: string;
  defaultModel: string;
}

export const DEFAULT_LLM_CONFIG: ILLMConfig = {
  models: DEFAULT_MODEL_CONFIGS,
  budget: DEFAULT_BUDGET_CONFIG,
  defaultProvider: "openai",
  defaultModel: "gpt-4o-mini",
};
