import type {
  BaseRepository,
  PaginatedResult,
  PaginationParams,
  Result,
} from "@packages/ddd-kit";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

export interface IMessageRepository extends BaseRepository<Message> {
  findByConversationId(
    conversationId: ConversationId,
    pagination?: PaginationParams,
  ): Promise<Result<PaginatedResult<Message>>>;
  countByConversationId(
    conversationId: ConversationId,
  ): Promise<Result<number>>;
}
