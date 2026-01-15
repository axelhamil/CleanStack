import type {
  BaseRepository,
  Option,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

export interface IConversationWithMessages {
  conversation: Conversation;
  messages: Message[];
}

export interface IConversationRepository extends BaseRepository<Conversation> {
  findById(id: ConversationId): Promise<Result<Option<Conversation>>>;
  findByUserId(
    userId: string,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Conversation>>>;
  getWithMessages(
    conversationId: ConversationId,
  ): Promise<Result<Option<IConversationWithMessages>>>;
}
