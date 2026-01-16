import type { Result } from "@packages/ddd-kit";
import type { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";

export interface LLMUsagePersistence {
  id: string;
  userId: string | null;
  conversationId: string | null;
  provider: "openai" | "anthropic" | "google";
  model: string;
  inputTokens: number;
  outputTokens: number;
  costAmount: number;
  costCurrency: string;
  requestDuration: number | null;
  promptKey: string | null;
  createdAt: Date;
}

// RED Phase Stub - Implementation in GREEN Phase
export function llmUsageToDomain(_record: unknown): Result<LLMUsage> {
  throw new Error("Not implemented");
}

export function llmUsageToPersistence(_usage: LLMUsage): LLMUsagePersistence {
  throw new Error("Not implemented");
}
