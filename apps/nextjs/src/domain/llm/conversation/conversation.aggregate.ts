import { Aggregate, type Option, UUID } from "@packages/ddd-kit";
import { ConversationId } from "./conversation-id";
import { ConversationCreatedEvent } from "./events/conversation-created.event";
import type { ConversationMetadata } from "./value-objects/conversation-metadata.vo";
import type { ConversationTitle } from "./value-objects/conversation-title.vo";

export interface IConversationProps {
  userId: string;
  title: Option<ConversationTitle>;
  metadata: Option<ConversationMetadata>;
  createdAt: Date;
  updatedAt?: Date;
}

export class Conversation extends Aggregate<IConversationProps> {
  private constructor(props: IConversationProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): ConversationId {
    return ConversationId.create(this._id);
  }

  static create(
    props: Omit<IConversationProps, "createdAt" | "updatedAt">,
    id?: UUID<string | number>,
  ): Conversation {
    const newId = id ?? new UUID<string>();
    const conversation = new Conversation(
      {
        ...props,
        createdAt: new Date(),
      },
      newId,
    );

    if (!id) {
      conversation.addEvent(new ConversationCreatedEvent(conversation));
    }

    return conversation;
  }

  static reconstitute(
    props: IConversationProps,
    id: ConversationId,
  ): Conversation {
    return new Conversation(props, id);
  }

  markUpdated(): void {
    this._props.updatedAt = new Date();
  }

  updateTitle(title: Option<ConversationTitle>): void {
    this._props.title = title;
    this._props.updatedAt = new Date();
  }

  updateMetadata(metadata: Option<ConversationMetadata>): void {
    this._props.metadata = metadata;
    this._props.updatedAt = new Date();
  }
}
