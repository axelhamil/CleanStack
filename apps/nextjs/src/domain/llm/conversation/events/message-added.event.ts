import { BaseDomainEvent } from "@packages/ddd-kit";
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

  constructor(message: Message) {
    super();
    const conversationId = message.get("conversationId");
    const role = message.get("role");
    const content = message.get("content");
    const model = message.get("model");

    this.aggregateId = conversationId.value.toString();
    this.payload = {
      conversationId: conversationId.value.toString(),
      messageId: message.id.value.toString(),
      role: role.value,
      content: content.value,
      model: model.isSome() ? model.unwrap() : null,
    };
  }
}
