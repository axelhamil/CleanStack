import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  ISendCompletionInputDto,
  ISendCompletionOutputDto,
} from "@/application/dto/llm/send-completion.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { ILLMProvider } from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type { IModelRouter } from "@/application/ports/model-router.port";
import {
  calculateCompletionCost,
  prepareCompletion,
} from "./_shared/completion.helper";
import { recordLLMUsage } from "./_shared/llm-usage.helper";

export class SendCompletionUseCase
  implements UseCase<ISendCompletionInputDto, ISendCompletionOutputDto>
{
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly modelRouter: IModelRouter,
    private readonly usageRepository: ILLMUsageRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ISendCompletionInputDto,
  ): Promise<Result<ISendCompletionOutputDto>> {
    const prepareResult = await prepareCompletion(
      {
        prompt: input.prompt,
        systemPrompt: input.systemPrompt,
        userId: input.userId,
        variables: input.variables,
        options: {
          maxBudget: input.options?.maxBudget,
          providers: input.options?.providers,
          capabilities: input.options?.capabilities ?? ["text"],
          temperature: input.options?.temperature,
          maxTokens: input.options?.maxTokens,
        },
      },
      this.modelRouter,
      this.usageRepository,
    );
    if (prepareResult.isFailure) {
      return Result.fail(prepareResult.getError());
    }
    const { selectedModel, modelConfig, messages } = prepareResult.getValue();

    const llmResult = await this.llmProvider.generateText({
      model: selectedModel.model,
      messages,
      temperature: input.options?.temperature,
      maxTokens: input.options?.maxTokens,
    });

    if (llmResult.isFailure) {
      return Result.fail(llmResult.getError());
    }

    const llmResponse = llmResult.getValue();
    const cost = calculateCompletionCost(llmResponse.usage, modelConfig);

    await recordLLMUsage(
      {
        userId: input.userId,
        conversationId: input.conversationId,
        selectedModel,
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
        cost,
      },
      this.usageRepository,
      this.eventDispatcher,
    );

    return Result.ok({
      content: llmResponse.content,
      model: llmResponse.model,
      provider: selectedModel.provider,
      usage: {
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
        totalTokens: llmResponse.usage.totalTokens,
      },
      cost: {
        amount: cost.amount,
        currency: cost.currency,
      },
    });
  }
}
