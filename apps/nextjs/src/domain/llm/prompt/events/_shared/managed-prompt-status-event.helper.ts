import type { ManagedPrompt } from "../../managed-prompt.aggregate";

export interface IManagedPromptStatusEventPayload {
  promptId: string;
  key: string;
  environment: string;
}

export function createManagedPromptStatusPayload(
  prompt: ManagedPrompt,
): IManagedPromptStatusEventPayload {
  return {
    promptId: prompt.id.value.toString(),
    key: prompt.get("key").value,
    environment: prompt.get("environment").value,
  };
}
