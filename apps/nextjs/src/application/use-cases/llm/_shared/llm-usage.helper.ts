import { Option, Result, UUID } from "@packages/ddd-kit";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type { ISelectedModel } from "@/application/ports/model-router.port";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import { ModelIdentifier } from "@/domain/llm/usage/value-objects/model-identifier.vo";
import { ProviderIdentifier } from "@/domain/llm/usage/value-objects/provider-identifier.vo";
import { TokenCount } from "@/domain/llm/usage/value-objects/token-count.vo";
import { UserId } from "@/domain/user/user-id";

export interface IUsageRecordParams {
  userId?: string;
  conversationId?: string;
  selectedModel: ISelectedModel;
  inputTokens: number;
  outputTokens: number;
  cost: { amount: number; currency: string };
}

export async function recordLLMUsage(
  params: IUsageRecordParams,
  usageRepository: ILLMUsageRepository,
  eventDispatcher: IEventDispatcher,
): Promise<void> {
  const providerResult = ProviderIdentifier.create(
    params.selectedModel.provider as "openai" | "anthropic" | "google",
  );
  const modelResult = ModelIdentifier.create(params.selectedModel.model);
  const inputTokensResult = TokenCount.create(params.inputTokens);
  const outputTokensResult = TokenCount.create(params.outputTokens);
  const costResult = Cost.create({
    amount: params.cost.amount,
    currency: params.cost.currency,
  });

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
    userId: params.userId
      ? Option.some(UserId.create(new UUID(params.userId)))
      : Option.none(),
    conversationId: params.conversationId
      ? Option.some(ConversationId.create(new UUID(params.conversationId)))
      : Option.none(),
    provider: providerResult.getValue(),
    model: modelResult.getValue(),
    inputTokens: inputTokensResult.getValue(),
    outputTokens: outputTokensResult.getValue(),
    cost: costResult.getValue(),
    requestDuration: Option.none(),
    promptKey: Option.none(),
  });

  const saveResult = await usageRepository.create(usage);
  if (saveResult.isFailure) {
    return;
  }

  await eventDispatcher.dispatchAll(usage.domainEvents);
  usage.clearEvents();
}
