import { BaseDomainEvent } from "@packages/ddd-kit";
import type { Conversation } from "../conversation.aggregate";

interface ConversationCreatedPayload {
  conversationId: string;
  userId: string;
  title: string | null;
}

export class ConversationCreatedEvent extends BaseDomainEvent<ConversationCreatedPayload> {
  readonly eventType = "conversation.created";
  readonly aggregateId: string;
  readonly payload: ConversationCreatedPayload;

  constructor(conversation: Conversation) {
    super();
    this.aggregateId = conversation.id.value.toString();
    this.payload = {
      conversationId: conversation.id.value.toString(),
      userId: conversation.userId,
      title: conversation.title.isSome()
        ? conversation.title.unwrap().value
        : null,
    };
  }
}
