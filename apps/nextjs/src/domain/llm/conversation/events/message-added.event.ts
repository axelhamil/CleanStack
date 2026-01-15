import { BaseDomainEvent } from "@packages/ddd-kit";
import type { Conversation } from "../conversation.aggregate";
import type { Message } from "../entities/message.entity";

interface MessageAddedPayload {
  conversationId: string;
  messageId: string;
  role: string;
  content: string;
  model: string | null;
}

export class MessageAddedEvent extends BaseDomainEvent<MessageAddedPayload> {
  readonly eventType = "conversation.message_added";
  readonly aggregateId: string;
  readonly payload: MessageAddedPayload;

  constructor(conversation: Conversation, message: Message) {
    super();
    this.aggregateId = conversation.id.value.toString();
    this.payload = {
      conversationId: conversation.id.value.toString(),
      messageId: message.id.value.toString(),
      role: message.role.value,
      content: message.content.value,
      model: message.model.isSome() ? message.model.unwrap() : null,
    };
  }
}
