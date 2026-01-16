import { match, Result } from "@packages/ddd-kit";
import type {
  ILLMMessage,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";

const DEFAULT_MAX_BUDGET = 100;

export function selectModelForCompletion(
  modelRouter: IModelRouter,
  options?: {
    maxBudget?: number;
    providers?: string[];
    capabilities?: string[];
  },
): Result<ISelectedModel> {
  return modelRouter.selectOptimalModel({
    capabilities: options?.capabilities ?? ["text"],
    maxBudget: options?.maxBudget,
    preferredProviders: options?.providers,
    strategy: "cheapest",
  });
}

export function getModelConfigOrFail(
  modelRouter: IModelRouter,
  selectedModel: ISelectedModel,
): Result<IModelConfig> {
  const configOption = modelRouter.getModelConfig(
    selectedModel.provider,
    selectedModel.model,
  );

  return match<IModelConfig, Result<IModelConfig>>(configOption, {
    Some: (config) => Result.ok(config),
    None: () => Result.fail("Model config not found"),
  });
}

export async function checkUserBudget(
  userId: string,
  usageRepository: ILLMUsageRepository,
  maxBudget?: number,
): Promise<Result<void>> {
  const budget = maxBudget ?? DEFAULT_MAX_BUDGET;

  const costResult = await usageRepository.getTotalCostByUser(userId, "day");

  if (costResult.isFailure) {
    return Result.fail(costResult.getError());
  }

  const currentCost = costResult.getValue();
  if (currentCost >= budget) {
    return Result.fail("Daily budget exceeded");
  }

  return Result.ok(undefined);
}

export function substitutePromptVariables(
  prompt: string,
  variables: Record<string, string>,
): string {
  let result = prompt;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return result;
}

export function buildMessagesForPrompt(
  prompt: string,
  systemPrompt?: string,
): ILLMMessage[] {
  const messages: ILLMMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: prompt });

  return messages;
}

export function calculateCompletionCost(
  usage: { inputTokens: number; outputTokens: number },
  modelConfig: IModelConfig,
): { amount: number; currency: string } {
  const inputCost = (usage.inputTokens / 1000) * modelConfig.costPer1kIn;
  const outputCost = (usage.outputTokens / 1000) * modelConfig.costPer1kOut;
  return {
    amount: inputCost + outputCost,
    currency: "USD",
  };
}

export interface ICompletionInput {
  prompt: string;
  systemPrompt?: string;
  userId?: string;
  variables?: Record<string, string>;
  options?: {
    maxBudget?: number;
    providers?: string[];
    capabilities?: string[];
    temperature?: number;
    maxTokens?: number;
  };
}

export interface ICompletionPrepared {
  selectedModel: ISelectedModel;
  modelConfig: IModelConfig;
  messages: ILLMMessage[];
}

export async function prepareCompletion(
  input: ICompletionInput,
  modelRouter: IModelRouter,
  usageRepository: ILLMUsageRepository,
): Promise<Result<ICompletionPrepared>> {
  if (!input.prompt || input.prompt.trim().length === 0) {
    return Result.fail("Prompt is required and cannot be empty");
  }

  const selectedModelResult = selectModelForCompletion(modelRouter, {
    maxBudget: input.options?.maxBudget,
    providers: input.options?.providers,
    capabilities: input.options?.capabilities,
  });
  if (selectedModelResult.isFailure) {
    return Result.fail(selectedModelResult.getError());
  }
  const selectedModel = selectedModelResult.getValue();

  const modelConfigResult = getModelConfigOrFail(modelRouter, selectedModel);
  if (modelConfigResult.isFailure) {
    return Result.fail(modelConfigResult.getError());
  }
  const modelConfig = modelConfigResult.getValue();

  if (input.userId) {
    const budgetCheckResult = await checkUserBudget(
      input.userId,
      usageRepository,
      input.options?.maxBudget,
    );
    if (budgetCheckResult.isFailure) {
      return Result.fail(budgetCheckResult.getError());
    }
  }

  const prompt = substitutePromptVariables(input.prompt, input.variables ?? {});
  const messages = buildMessagesForPrompt(prompt, input.systemPrompt);

  return Result.ok({ selectedModel, modelConfig, messages });
}
