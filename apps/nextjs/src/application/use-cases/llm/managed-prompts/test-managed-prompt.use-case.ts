import type { UseCase } from "@packages/ddd-kit";
import { Result } from "@packages/ddd-kit";
import type {
  ITestManagedPromptInputDto,
  ITestManagedPromptOutputDto,
} from "@/application/dto/llm/test-managed-prompt.dto";
import type {
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { findPromptById } from "./_shared/managed-prompt-dto.helper";

export class TestManagedPromptUseCase
  implements UseCase<ITestManagedPromptInputDto, ITestManagedPromptOutputDto>
{
  constructor(
    private readonly promptRepository: IManagedPromptRepository,
    private readonly llmProvider: ILLMProvider,
  ) {}

  async execute(
    input: ITestManagedPromptInputDto,
  ): Promise<Result<ITestManagedPromptOutputDto>> {
    const promptResult = await findPromptById(
      input.promptId,
      this.promptRepository,
    );
    if (promptResult.isFailure) {
      return Result.fail(promptResult.getError());
    }
    const prompt = promptResult.getValue();

    const renderResult = prompt.render(input.variables);
    if (renderResult.isFailure) {
      return renderResult as unknown as Result<ITestManagedPromptOutputDto>;
    }

    const renderedPrompt = renderResult.getValue();

    const availableModels = this.llmProvider.getAvailableModels();
    const enabledModels = availableModels.filter((m) => m.enabled);

    if (enabledModels.length === 0) {
      return Result.fail("No LLM models available");
    }

    const selectedModelResult = this.selectModel(
      enabledModels,
      input.model,
      input.provider,
    );
    if (selectedModelResult.isFailure) {
      return Result.fail(selectedModelResult.getError());
    }

    const selectedModel = selectedModelResult.getValue();

    const generateResult = await this.llmProvider.generateText({
      model: selectedModel.model,
      messages: [{ role: "user", content: renderedPrompt }],
    });

    if (generateResult.isFailure) {
      return generateResult as unknown as Result<ITestManagedPromptOutputDto>;
    }

    const response = generateResult.getValue();

    const inputCost =
      (response.usage.inputTokens / 1000) * selectedModel.costPer1kIn;
    const outputCost =
      (response.usage.outputTokens / 1000) * selectedModel.costPer1kOut;
    const totalCost = inputCost + outputCost;

    return Result.ok({
      renderedPrompt,
      response: response.content,
      model: selectedModel.model,
      provider: selectedModel.provider,
      usage: {
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        totalTokens: response.usage.totalTokens,
      },
      cost: {
        amount: totalCost,
        currency: "USD",
      },
    });
  }

  private selectModel(
    enabledModels: IModelConfig[],
    model?: string,
    provider?: string,
  ): Result<IModelConfig> {
    if (model && provider) {
      const found = enabledModels.find(
        (m) => m.model === model && m.provider === provider,
      );
      if (!found) {
        return Result.fail(
          `Model '${model}' from provider '${provider}' not found or not enabled`,
        );
      }
      return Result.ok(found);
    }

    if (model) {
      const found = enabledModels.find((m) => m.model === model);
      if (!found) {
        return Result.fail(`Model '${model}' not found or not enabled`);
      }
      return Result.ok(found);
    }

    if (provider) {
      const found = enabledModels.find((m) => m.provider === provider);
      if (!found) {
        return Result.fail(
          `No enabled models found for provider '${provider}'`,
        );
      }
      return Result.ok(found);
    }

    return Result.ok(enabledModels[0]);
  }
}
