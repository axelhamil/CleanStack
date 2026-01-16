import type { Result } from "@packages/ddd-kit";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

export interface MessagePersistence {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  costAmount: number | null;
  costCurrency: string;
  createdAt: Date;
}

// RED Phase Stub - Implementation in GREEN Phase
export function messageToDomain(_record: unknown): Result<Message> {
  throw new Error("Not implemented");
}

export function messageToPersistence(_message: Message): MessagePersistence {
  throw new Error("Not implemented");
}
