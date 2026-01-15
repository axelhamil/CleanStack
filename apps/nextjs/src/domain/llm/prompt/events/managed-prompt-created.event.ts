import { BaseDomainEvent } from "@packages/ddd-kit";
import type { ManagedPrompt } from "../managed-prompt.aggregate";

interface IManagedPromptCreatedEventPayload {
  promptId: string;
  key: string;
  name: string;
  environment: string;
  version: number;
}

export class ManagedPromptCreatedEvent extends BaseDomainEvent<IManagedPromptCreatedEventPayload> {
  readonly eventType = "managed-prompt.created";
  readonly aggregateId: string;
  readonly payload: IManagedPromptCreatedEventPayload;

  constructor(prompt: ManagedPrompt) {
    super();
    this.aggregateId = prompt.id.value.toString();
    this.payload = {
      promptId: prompt.id.value.toString(),
      key: prompt.get("key").value,
      name: prompt.get("name").value,
      environment: prompt.get("environment").value,
      version: prompt.get("version"),
    };
  }
}
