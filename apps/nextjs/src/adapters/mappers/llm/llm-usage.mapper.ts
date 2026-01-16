import { Option, Result, UUID } from "@packages/ddd-kit";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import { Duration } from "@/domain/llm/usage/value-objects/duration.vo";
import { ModelIdentifier } from "@/domain/llm/usage/value-objects/model-identifier.vo";
import {
  ProviderIdentifier,
  type ProviderType,
} from "@/domain/llm/usage/value-objects/provider-identifier.vo";
import { TokenCount } from "@/domain/llm/usage/value-objects/token-count.vo";
import { UserId } from "@/domain/user/user-id";

export interface LLMUsagePersistence {
  id: string;
  userId: string | null;
  conversationId: string | null;
  provider: "openai" | "anthropic" | "google";
  model: string;
  inputTokens: number;
  outputTokens: number;
  costAmount: number;
  costCurrency: string;
  requestDuration: number | null;
  promptKey: string | null;
  createdAt: Date;
}

export function llmUsageToDomain(
  record: LLMUsagePersistence,
): Result<LLMUsage> {
  const providerResult = ProviderIdentifier.create(
    record.provider as ProviderType,
  );
  if (providerResult.isFailure) {
    return Result.fail(`Invalid provider: ${providerResult.getError()}`);
  }

  const modelResult = ModelIdentifier.create(record.model);
  if (modelResult.isFailure) {
    return Result.fail(`Invalid model: ${modelResult.getError()}`);
  }

  const inputTokensResult = TokenCount.create(record.inputTokens);
  if (inputTokensResult.isFailure) {
    return Result.fail(`Invalid inputTokens: ${inputTokensResult.getError()}`);
  }

  const outputTokensResult = TokenCount.create(record.outputTokens);
  if (outputTokensResult.isFailure) {
    return Result.fail(
      `Invalid outputTokens: ${outputTokensResult.getError()}`,
    );
  }

  const costResult = Cost.create({
    amount: record.costAmount,
    currency: record.costCurrency,
  });
  if (costResult.isFailure) {
    return Result.fail(`Invalid cost: ${costResult.getError()}`);
  }

  let durationOption: Option<Duration> = Option.none();
  if (record.requestDuration !== null) {
    const durationResult = Duration.create(record.requestDuration);
    if (durationResult.isFailure) {
      return Result.fail(
        `Invalid requestDuration: ${durationResult.getError()}`,
      );
    }
    durationOption = Option.some(durationResult.getValue());
  }

  const userIdOption: Option<UserId> =
    record.userId !== null
      ? Option.some(UserId.create(new UUID(record.userId)))
      : Option.none();

  const conversationIdOption: Option<ConversationId> =
    record.conversationId !== null
      ? Option.some(ConversationId.create(new UUID(record.conversationId)))
      : Option.none();

  const promptKeyOption: Option<string> =
    record.promptKey !== null ? Option.some(record.promptKey) : Option.none();

  const usage = LLMUsage.reconstitute(
    {
      userId: userIdOption,
      conversationId: conversationIdOption,
      provider: providerResult.getValue(),
      model: modelResult.getValue(),
      inputTokens: inputTokensResult.getValue(),
      outputTokens: outputTokensResult.getValue(),
      cost: costResult.getValue(),
      requestDuration: durationOption,
      promptKey: promptKeyOption,
      createdAt: record.createdAt,
    },
    new UUID(record.id),
  );

  return Result.ok(usage);
}

export function llmUsageToPersistence(usage: LLMUsage): LLMUsagePersistence {
  const userId = usage.get("userId");
  const conversationId = usage.get("conversationId");
  const requestDuration = usage.get("requestDuration");
  const promptKey = usage.get("promptKey");

  return {
    id: String(usage.id.value),
    userId: userId.isSome() ? String(userId.unwrap().value) : null,
    conversationId: conversationId.isSome()
      ? String(conversationId.unwrap().value)
      : null,
    provider: usage.get("provider").value,
    model: usage.get("model").value,
    inputTokens: usage.get("inputTokens").value,
    outputTokens: usage.get("outputTokens").value,
    costAmount: usage.get("cost").amount,
    costCurrency: usage.get("cost").currency,
    requestDuration: requestDuration.isSome()
      ? requestDuration.unwrap().value
      : null,
    promptKey: promptKey.isSome() ? promptKey.unwrap() : null,
    createdAt: usage.get("createdAt"),
  };
}
