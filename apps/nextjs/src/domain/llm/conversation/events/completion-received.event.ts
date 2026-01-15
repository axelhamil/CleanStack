import { BaseDomainEvent } from "@packages/ddd-kit";
import type { Message } from "../entities/message.entity";

interface CompletionReceivedPayload {
  conversationId: string;
  messageId: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  cost: number | null;
  currency: string | null;
}

export class CompletionReceivedEvent extends BaseDomainEvent<CompletionReceivedPayload> {
  readonly eventType = "conversation.completion_received";
  readonly aggregateId: string;
  readonly payload: CompletionReceivedPayload;

  constructor(message: Message) {
    super();
    const conversationId = message.get("conversationId");
    const model = message.get("model");
    const tokenUsageOpt = message.get("tokenUsage");
    const costOpt = message.get("cost");

    const tokenUsage = tokenUsageOpt.isSome() ? tokenUsageOpt.unwrap() : null;
    const cost = costOpt.isSome() ? costOpt.unwrap() : null;

    this.aggregateId = conversationId.value.toString();
    this.payload = {
      conversationId: conversationId.value.toString(),
      messageId: message.id.value.toString(),
      model: model.isSome() ? model.unwrap() : null,
      inputTokens: tokenUsage?.inputTokens ?? null,
      outputTokens: tokenUsage?.outputTokens ?? null,
      totalTokens: tokenUsage?.totalTokens ?? null,
      cost: cost?.amount ?? null,
      currency: cost?.currency ?? null,
    };
  }
}
