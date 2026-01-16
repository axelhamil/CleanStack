import { match, type Option, Result, UUID } from "@packages/ddd-kit";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

export interface IMessageDto {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface IConversationBaseDto {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export function parseConversationId(id: string): Result<ConversationId> {
  try {
    const uuid = new UUID<string>(id);
    return Result.ok(ConversationId.create(uuid));
  } catch {
    return Result.fail("Invalid conversation ID");
  }
}

export function verifyConversationOwnership(
  conversation: Conversation,
  userId: string,
): boolean {
  return conversation.get("userId") === userId;
}

export function mapMessageToDto(message: Message): IMessageDto {
  return {
    id: message.id.value.toString(),
    role: message.get("role").value as "user" | "assistant" | "system",
    content: message.get("content").value,
    createdAt: message.get("createdAt").toISOString(),
  };
}

export function mapConversationToBaseDto(
  conversation: Conversation,
): IConversationBaseDto {
  const title = conversation.get("title");
  const props = conversation.getProps();
  return {
    id: conversation.id.value.toString(),
    title: title.isSome() ? title.unwrap().value : null,
    createdAt: conversation.get("createdAt").toISOString(),
    updatedAt: props.updatedAt ? props.updatedAt.toISOString() : null,
  };
}

export async function findConversationWithOwnershipCheck(
  conversationIdStr: string,
  userId: string,
  conversationRepository: IConversationRepository,
): Promise<Result<Conversation>> {
  const conversationIdResult = parseConversationId(conversationIdStr);
  if (conversationIdResult.isFailure) {
    return Result.fail(conversationIdResult.getError());
  }

  const conversationId = conversationIdResult.getValue();

  const conversationResult =
    await conversationRepository.findById(conversationId);
  if (conversationResult.isFailure) {
    return Result.fail(conversationResult.getError());
  }

  return unwrapConversationOption(conversationResult.getValue(), userId);
}

function unwrapConversationOption(
  optionResult: Option<Conversation>,
  userId: string,
): Result<Conversation> {
  return match(optionResult, {
    Some: (conversation: Conversation) => {
      if (!verifyConversationOwnership(conversation, userId)) {
        return Result.fail("Conversation access unauthorized");
      }
      return Result.ok(conversation);
    },
    None: () => Result.fail("Conversation not found"),
  });
}
