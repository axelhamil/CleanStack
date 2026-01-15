import { BaseDomainEvent } from "@packages/ddd-kit";
import type { Conversation } from "../conversation.aggregate";

interface ConversationDeletedPayload {
  conversationId: string;
  userId: string;
}

export class ConversationDeletedEvent extends BaseDomainEvent<ConversationDeletedPayload> {
  readonly eventType = "conversation.deleted";
  readonly aggregateId: string;
  readonly payload: ConversationDeletedPayload;

  constructor(conversation: Conversation) {
    super();
    this.aggregateId = conversation.id.value.toString();
    this.payload = {
      conversationId: conversation.id.value.toString(),
      userId: conversation.get("userId"),
    };
  }
}
