import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IStreamCompletionInputDto,
  IStreamCompletionOutputDto,
} from "@/application/dto/llm/stream-completion.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  ILLMMessage,
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import { ModelIdentifier } from "@/domain/llm/usage/value-objects/model-identifier.vo";
import { ProviderIdentifier } from "@/domain/llm/usage/value-objects/provider-identifier.vo";
import { TokenCount } from "@/domain/llm/usage/value-objects/token-count.vo";

const DEFAULT_MAX_BUDGET = 100;

export class StreamCompletionUseCase
  implements UseCase<IStreamCompletionInputDto, IStreamCompletionOutputDto>
{
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly modelRouter: IModelRouter,
    private readonly usageRepository: ILLMUsageRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IStreamCompletionInputDto,
  ): Promise<Result<IStreamCompletionOutputDto>> {
    const validationResult = this.validateInput(input);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }

    const selectedModelResult = this.selectModel(input);
    if (selectedModelResult.isFailure) {
      return Result.fail(selectedModelResult.getError());
    }
    const selectedModel = selectedModelResult.getValue();

    const modelConfigResult = this.getModelConfig(selectedModel);
    if (modelConfigResult.isFailure) {
      return Result.fail(modelConfigResult.getError());
    }
    const modelConfig = modelConfigResult.getValue();

    if (input.userId) {
      const budgetCheckResult = await this.checkBudget(
        input.userId,
        input.options?.maxBudget,
      );
      if (budgetCheckResult.isFailure) {
        return Result.fail(budgetCheckResult.getError());
      }
    }

    const prompt = this.substituteVariables(
      input.prompt,
      input.variables ?? {},
    );
    const messages = this.buildMessages(prompt, input.systemPrompt);

    const streamResult = await this.llmProvider.streamText({
      model: selectedModel.model,
      messages,
      temperature: input.options?.temperature,
      maxTokens: input.options?.maxTokens,
    });

    if (streamResult.isFailure) {
      return Result.fail(streamResult.getError());
    }

    const streamResponse = streamResult.getValue();

    // Record usage when stream completes (usage is a Promise)
    this.handleStreamCompletion(
      input,
      selectedModel,
      modelConfig,
      streamResponse.usage,
    );

    return Result.ok({
      stream: streamResponse.stream,
      model: selectedModel.model,
      provider: selectedModel.provider,
    });
  }

  private validateInput(input: IStreamCompletionInputDto): Result<void> {
    if (!input.prompt || input.prompt.trim().length === 0) {
      return Result.fail("Prompt is required and cannot be empty");
    }
    return Result.ok(undefined);
  }

  private selectModel(
    input: IStreamCompletionInputDto,
  ): Result<ISelectedModel> {
    return this.modelRouter.selectOptimalModel({
      capabilities: ["text"],
      maxBudget: input.options?.maxBudget,
      preferredProviders: input.options?.providers,
      strategy: "cheapest",
    });
  }

  private getModelConfig(selectedModel: ISelectedModel): Result<IModelConfig> {
    const configOption = this.modelRouter.getModelConfig(
      selectedModel.provider,
      selectedModel.model,
    );

    return match<IModelConfig, Result<IModelConfig>>(configOption, {
      Some: (config) => Result.ok(config),
      None: () => Result.fail("Model config not found"),
    });
  }

  private async checkBudget(
    userId: string,
    maxBudget?: number,
  ): Promise<Result<void>> {
    const budget = maxBudget ?? DEFAULT_MAX_BUDGET;

    const costResult = await this.usageRepository.getTotalCostByUser(
      userId,
      "day",
    );

    if (costResult.isFailure) {
      return Result.fail(costResult.getError());
    }

    const currentCost = costResult.getValue();
    if (currentCost >= budget) {
      return Result.fail("Daily budget exceeded");
    }

    return Result.ok(undefined);
  }

  private substituteVariables(
    prompt: string,
    variables: Record<string, string>,
  ): string {
    let result = prompt;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value);
    }
    return result;
  }

  private buildMessages(prompt: string, systemPrompt?: string): ILLMMessage[] {
    const messages: ILLMMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    return messages;
  }

  private handleStreamCompletion(
    input: IStreamCompletionInputDto,
    selectedModel: ISelectedModel,
    modelConfig: IModelConfig,
    usagePromise: Promise<{ inputTokens: number; outputTokens: number }>,
  ): void {
    usagePromise
      .then((usage) => {
        const cost = this.calculateCost(usage, modelConfig);
        return this.recordUsage(input, selectedModel, usage, cost);
      })
      .catch(() => {
        // Silently handle errors - stream may have been cancelled
      });
  }

  private calculateCost(
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

  private async recordUsage(
    input: IStreamCompletionInputDto,
    selectedModel: ISelectedModel,
    usageData: { inputTokens: number; outputTokens: number },
    cost: { amount: number; currency: string },
  ): Promise<void> {
    const providerResult = ProviderIdentifier.create(
      selectedModel.provider as "openai" | "anthropic" | "google",
    );
    const modelResult = ModelIdentifier.create(selectedModel.model as string);
    const inputTokensResult = TokenCount.create(
      usageData.inputTokens as number,
    );
    const outputTokensResult = TokenCount.create(
      usageData.outputTokens as number,
    );
    const costResult = Cost.create({
      amount: cost.amount,
      currency: cost.currency,
    } as { amount: number; currency: string });

    const combined = Result.combine([
      providerResult,
      modelResult,
      inputTokensResult,
      outputTokensResult,
      costResult,
    ]);

    if (combined.isFailure) {
      return;
    }

    const usage = LLMUsage.create({
      userId: Option.fromNullable(input.userId),
      conversationId: Option.fromNullable(input.conversationId),
      provider: providerResult.getValue(),
      model: modelResult.getValue(),
      inputTokens: inputTokensResult.getValue(),
      outputTokens: outputTokensResult.getValue(),
      cost: costResult.getValue(),
      requestDuration: Option.none(),
      promptKey: Option.none(),
    });

    const saveResult = await this.usageRepository.create(usage);
    if (saveResult.isFailure) {
      return;
    }

    await this.eventDispatcher.dispatchAll(usage.domainEvents);
    usage.clearEvents();
  }
}
