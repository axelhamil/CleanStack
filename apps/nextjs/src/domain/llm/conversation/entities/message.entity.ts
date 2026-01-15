import { Entity, type Option, UUID } from "@packages/ddd-kit";
import type { ConversationId } from "../conversation-id";
import type { Cost } from "../value-objects/cost.vo";
import type { MessageContent } from "../value-objects/message-content.vo";
import type { MessageRole } from "../value-objects/message-role.vo";
import type { TokenUsage } from "../value-objects/token-usage.vo";
import { MessageId } from "./message-id";

export interface IMessageProps {
  conversationId: ConversationId;
  role: MessageRole;
  content: MessageContent;
  model: Option<string>;
  tokenUsage: Option<TokenUsage>;
  cost: Option<Cost>;
  createdAt: Date;
}

export class Message extends Entity<IMessageProps> {
  private constructor(props: IMessageProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): MessageId {
    return MessageId.create(this._id);
  }

  static create(
    props: Omit<IMessageProps, "createdAt">,
    id?: UUID<string | number>,
  ): Message {
    return new Message(
      {
        ...props,
        createdAt: new Date(),
      },
      id ?? new UUID<string>(),
    );
  }

  static reconstitute(props: IMessageProps, id: MessageId): Message {
    return new Message(props, id);
  }
}
