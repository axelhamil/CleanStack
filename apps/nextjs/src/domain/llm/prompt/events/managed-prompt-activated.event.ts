import { BaseDomainEvent } from "@packages/ddd-kit";
import type { ManagedPrompt } from "../managed-prompt.aggregate";

interface IManagedPromptActivatedEventPayload {
  promptId: string;
  key: string;
  environment: string;
}

export class ManagedPromptActivatedEvent extends BaseDomainEvent<IManagedPromptActivatedEventPayload> {
  readonly eventType = "managed-prompt.activated";
  readonly aggregateId: string;
  readonly payload: IManagedPromptActivatedEventPayload;

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
