import { Result, type UseCase } from "@packages/ddd-kit";
import type {
  IStreamCompletionInputDto,
  IStreamCompletionOutputDto,
} from "@/application/dto/llm/stream-completion.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import {
  calculateCompletionCost,
  prepareCompletion,
} from "./_shared/completion.helper";
import { recordLLMUsage } from "./_shared/llm-usage.helper";

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
    const prepareResult = await prepareCompletion(
      {
        prompt: input.prompt,
        systemPrompt: input.systemPrompt,
        userId: input.userId,
        variables: input.variables,
        options: {
          maxBudget: input.options?.maxBudget,
          providers: input.options?.providers,
          capabilities: ["text"],
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

  private handleStreamCompletion(
    input: IStreamCompletionInputDto,
    selectedModel: ISelectedModel,
    modelConfig: IModelConfig,
    usagePromise: Promise<{ inputTokens: number; outputTokens: number }>,
  ): void {
    usagePromise
      .then((usage) => {
        const cost = calculateCompletionCost(usage, modelConfig);
        return recordLLMUsage(
          {
            userId: input.userId,
            conversationId: input.conversationId,
            selectedModel,
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            cost,
          },
          this.usageRepository,
          this.eventDispatcher,
        );
      })
      .catch(() => {
        // Silently handle errors - stream may have been cancelled
      });
  }
}
