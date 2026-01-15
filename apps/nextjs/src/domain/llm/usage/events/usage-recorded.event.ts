import { BaseDomainEvent, match } from "@packages/ddd-kit";
import type { LLMUsage } from "../llm-usage.aggregate";

interface IUsageRecordedEventPayload {
  usageId: string;
  userId: string | null;
  conversationId: string | null;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costAmount: number;
  costCurrency: string;
  requestDuration: number | null;
  promptKey: string | null;
}

export class UsageRecordedEvent extends BaseDomainEvent<IUsageRecordedEventPayload> {
  readonly eventType = "llm-usage.recorded";
  readonly aggregateId: string;
  readonly payload: IUsageRecordedEventPayload;

  constructor(usage: LLMUsage) {
    super();
    this.aggregateId = usage.id.value.toString();
    this.payload = {
      usageId: usage.id.value.toString(),
      userId: match<string, string | null>(usage.get("userId"), {
        Some: (v) => v,
        None: () => null,
      }),
      conversationId: match<string, string | null>(
        usage.get("conversationId"),
        {
          Some: (v) => v,
          None: () => null,
        },
      ),
      provider: usage.get("provider").value,
      model: usage.get("model").value,
      inputTokens: usage.get("inputTokens").value,
      outputTokens: usage.get("outputTokens").value,
      totalTokens: usage.totalTokens,
      costAmount: usage.get("cost").amount,
      costCurrency: usage.get("cost").currency,
      requestDuration: match(usage.get("requestDuration"), {
        Some: (v) => v.value,
        None: () => null,
      }) as number | null,
      promptKey: match<string, string | null>(usage.get("promptKey"), {
        Some: (v) => v,
        None: () => null,
      }),
    };
  }
}
