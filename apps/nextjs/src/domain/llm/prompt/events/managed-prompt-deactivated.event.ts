import { BaseDomainEvent } from "@packages/ddd-kit";
import type { ManagedPrompt } from "../managed-prompt.aggregate";

interface IManagedPromptDeactivatedEventPayload {
  promptId: string;
  key: string;
  environment: string;
}

export class ManagedPromptDeactivatedEvent extends BaseDomainEvent<IManagedPromptDeactivatedEventPayload> {
  readonly eventType = "managed-prompt.deactivated";
  readonly aggregateId: string;
  readonly payload: IManagedPromptDeactivatedEventPayload;

  constructor(prompt: ManagedPrompt) {
    super();
    this.aggregateId = prompt.id.value.toString();
    this.payload = {
      promptId: prompt.id.value.toString(),
      key: prompt.get("key").value,
      environment: prompt.get("environment").value,
    };
  }
}
