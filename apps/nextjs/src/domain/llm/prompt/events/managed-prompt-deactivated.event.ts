import { BaseDomainEvent } from "@packages/ddd-kit";
import type { ManagedPrompt } from "../managed-prompt.aggregate";
import {
  createManagedPromptStatusPayload,
  type IManagedPromptStatusEventPayload,
} from "./_shared/managed-prompt-status-event.helper";

export class ManagedPromptDeactivatedEvent extends BaseDomainEvent<IManagedPromptStatusEventPayload> {
  readonly eventType = "managed-prompt.deactivated";
  readonly aggregateId: string;
  readonly payload: IManagedPromptStatusEventPayload;

  constructor(prompt: ManagedPrompt) {
    super();
    this.aggregateId = prompt.id.value.toString();
    this.payload = createManagedPromptStatusPayload(prompt);
  }
}
