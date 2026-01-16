import type { Result } from "@packages/ddd-kit";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";

export interface ConversationPersistence {
  id: string;
  userId: string;
  title: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date | undefined;
}

// RED Phase Stub - Implementation in GREEN Phase
export function conversationToDomain(_record: unknown): Result<Conversation> {
  throw new Error("Not implemented");
}

export function conversationToPersistence(
  _conversation: Conversation,
): ConversationPersistence {
  throw new Error("Not implemented");
}
