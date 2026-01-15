import { BaseDomainEvent } from "@packages/ddd-kit";
import type { ManagedPrompt } from "../managed-prompt.aggregate";

interface IManagedPromptUpdatedEventPayload {
  promptId: string;
  key: string;
  previousVersion: number;
  newVersion: number;
}

export class ManagedPromptUpdatedEvent extends BaseDomainEvent<IManagedPromptUpdatedEventPayload> {
  readonly eventType = "managed-prompt.updated";
  readonly aggregateId: string;
  readonly payload: IManagedPromptUpdatedEventPayload;

  constructor(prompt: ManagedPrompt, previousVersion: number) {
    super();
    this.aggregateId = prompt.id.value.toString();
    this.payload = {
      promptId: prompt.id.value.toString(),
      key: prompt.get("key").value,
      previousVersion,
      newVersion: prompt.get("version"),
    };
  }
}
