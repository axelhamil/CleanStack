import type { Result } from "@packages/ddd-kit";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";

export interface PromptVariablePersistence {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  defaultValue?: string;
}

export interface ManagedPromptPersistence {
  id: string;
  key: string;
  name: string;
  description: string | null;
  template: string;
  variables: PromptVariablePersistence[];
  version: number;
  environment: "development" | "staging" | "production";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | undefined;
}

// RED Phase Stub - Implementation in GREEN Phase
export function managedPromptToDomain(_record: unknown): Result<ManagedPrompt> {
  throw new Error("Not implemented");
}

export function managedPromptToPersistence(
  _prompt: ManagedPrompt,
): ManagedPromptPersistence {
  throw new Error("Not implemented");
}
