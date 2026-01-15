import { Aggregate, type Option, UUID } from "@packages/ddd-kit";
import type { Cost } from "../conversation/value-objects/cost.vo";
import { UsageRecordedEvent } from "./events/usage-recorded.event";
import { LLMUsageId } from "./llm-usage-id";
import type { Duration } from "./value-objects/duration.vo";
import type { ModelIdentifier } from "./value-objects/model-identifier.vo";
import type { ProviderIdentifier } from "./value-objects/provider-identifier.vo";
import type { TokenCount } from "./value-objects/token-count.vo";

interface ILLMUsageProps {
  userId: Option<string>;
  conversationId: Option<string>;
  provider: ProviderIdentifier;
  model: ModelIdentifier;
  inputTokens: TokenCount;
  outputTokens: TokenCount;
  cost: Cost;
  requestDuration: Option<Duration>;
  promptKey: Option<string>;
  createdAt: Date;
}

export class LLMUsage extends Aggregate<ILLMUsageProps> {
  private constructor(props: ILLMUsageProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): LLMUsageId {
    return LLMUsageId.create(this._id);
  }

  get totalTokens(): number {
    return this._props.inputTokens.value + this._props.outputTokens.value;
  }

  static create(
    props: Omit<ILLMUsageProps, "createdAt">,
    id?: UUID<string | number>,
  ): LLMUsage {
    const usage = new LLMUsage(
      {
        ...props,
        createdAt: new Date(),
      },
      id ?? new UUID<string>(),
    );
    usage.addEvent(new UsageRecordedEvent(usage));
    return usage;
  }

  static reconstitute(
    props: ILLMUsageProps,
    id: UUID<string | number>,
  ): LLMUsage {
    return new LLMUsage(props, id);
  }
}
