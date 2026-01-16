import { Option, Result, UUID } from "@packages/ddd-kit";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { ConversationMetadata } from "@/domain/llm/conversation/value-objects/conversation-metadata.vo";
import { ConversationTitle } from "@/domain/llm/conversation/value-objects/conversation-title.vo";

export interface ConversationPersistence {
  id: string;
  userId: string;
  title: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export function conversationToDomain(
  record: ConversationPersistence,
): Result<Conversation> {
  const id = ConversationId.create(new UUID(record.id));

  let titleOption: Option<ConversationTitle> = Option.none();
  if (record.title !== null) {
    const titleResult = ConversationTitle.create(record.title);
    if (titleResult.isFailure) {
      return Result.fail(`Invalid title: ${titleResult.getError()}`);
    }
    titleOption = Option.some(titleResult.getValue());
  }

  let metadataOption: Option<ConversationMetadata> = Option.none();
  if (record.metadata !== null) {
    const metadata = new ConversationMetadata(record.metadata);
    metadataOption = Option.some(metadata);
  }

  const conversation = Conversation.reconstitute(
    {
      userId: record.userId,
      title: titleOption,
      metadata: metadataOption,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt ?? undefined,
    },
    id,
  );

  return Result.ok(conversation);
}

export function conversationToPersistence(
  conversation: Conversation,
): ConversationPersistence {
  const props = conversation.getProps();
  const title = props.title;
  const metadata = props.metadata;

  return {
    id: String(conversation.id.value),
    userId: props.userId,
    title: title.isSome() ? title.unwrap().value : null,
    metadata: metadata.isSome() ? metadata.unwrap().value : null,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt ?? null,
  };
}
