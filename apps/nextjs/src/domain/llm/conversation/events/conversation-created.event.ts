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
    const userId = conversation.get("userId");
    const title = conversation.get("title");

    this.aggregateId = conversation.id.value.toString();
    this.payload = {
      conversationId: conversation.id.value.toString(),
      userId,
      title: title.isSome() ? title.unwrap().value : null,
    };
  }
}
