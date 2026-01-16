import type { Option, PaginatedResult, Result } from "@packages/ddd-kit";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";
import type { MessageId } from "@/domain/llm/conversation/entities/message-id";

/**
 * Drizzle implementation of IMessageRepository
 * TDD: Stub for RED phase - implement in GREEN phase
 */
export class DrizzleMessageRepository implements IMessageRepository {
  create(_message: Message): Promise<Result<Message>> {
    throw new Error("Not implemented");
  }

  update(_message: Message): Promise<Result<Message>> {
    throw new Error("Not implemented");
  }

  delete(_id: MessageId): Promise<Result<MessageId>> {
    throw new Error("Not implemented");
  }

  findById(_id: MessageId): Promise<Result<Option<Message>>> {
    throw new Error("Not implemented");
  }

  findByConversationId(
    _conversationId: ConversationId,
    _pagination?: { page: number; limit: number },
  ): Promise<Result<PaginatedResult<Message>>> {
    throw new Error("Not implemented");
  }

  countByConversationId(
    _conversationId: ConversationId,
  ): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  findAll(_pagination?: {
    page: number;
    limit: number;
  }): Promise<Result<PaginatedResult<Message>>> {
    throw new Error("Not implemented");
  }

  exists(_id: MessageId): Promise<Result<boolean>> {
    throw new Error("Not implemented");
  }

  count(): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  findMany(
    _props: Partial<Message["_props"]>,
    _pagination?: { page: number; limit: number },
  ): Promise<Result<PaginatedResult<Message>>> {
    throw new Error("Not implemented");
  }

  findBy(_props: Partial<Message["_props"]>): Promise<Result<Option<Message>>> {
    throw new Error("Not implemented");
  }
}
