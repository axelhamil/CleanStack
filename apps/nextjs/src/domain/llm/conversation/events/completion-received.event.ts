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
    this.aggregateId = message.conversationId;

    const tokenUsage = message.tokenUsage.isSome()
      ? message.tokenUsage.unwrap()
      : null;
    const cost = message.cost.isSome() ? message.cost.unwrap() : null;

    this.payload = {
      conversationId: message.conversationId,
      messageId: message.id.value.toString(),
      model: message.model.isSome() ? message.model.unwrap() : null,
      inputTokens: tokenUsage?.inputTokens ?? null,
      outputTokens: tokenUsage?.outputTokens ?? null,
      totalTokens: tokenUsage?.totalTokens ?? null,
      cost: cost?.amount ?? null,
      currency: cost?.currency ?? null,
    };
  }
}
