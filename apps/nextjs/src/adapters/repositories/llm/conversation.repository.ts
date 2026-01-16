import type { Option, PaginatedResult, Result } from "@packages/ddd-kit";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

/**
 * Drizzle implementation of IConversationRepository
 * TDD: Stub for RED phase - implement in GREEN phase
 */
export class DrizzleConversationRepository implements IConversationRepository {
  create(_conversation: Conversation): Promise<Result<Conversation>> {
    throw new Error("Not implemented");
  }

  update(_conversation: Conversation): Promise<Result<Conversation>> {
    throw new Error("Not implemented");
  }

  delete(_id: ConversationId): Promise<Result<ConversationId>> {
    throw new Error("Not implemented");
  }

  findById(_id: ConversationId): Promise<Result<Option<Conversation>>> {
    throw new Error("Not implemented");
  }

  findByUserId(
    _userId: string,
    _pagination?: { page: number; limit: number },
  ): Promise<Result<PaginatedResult<Conversation>>> {
    throw new Error("Not implemented");
  }

  getWithMessages(
    _id: ConversationId,
  ): Promise<
    Result<Option<{ conversation: Conversation; messages: Message[] }>>
  > {
    throw new Error("Not implemented");
  }

  findAll(_pagination?: {
    page: number;
    limit: number;
  }): Promise<Result<PaginatedResult<Conversation>>> {
    throw new Error("Not implemented");
  }

  exists(_id: ConversationId): Promise<Result<boolean>> {
    throw new Error("Not implemented");
  }

  count(): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  findMany(
    _props: Partial<Conversation["_props"]>,
    _pagination?: { page: number; limit: number },
  ): Promise<Result<PaginatedResult<Conversation>>> {
    throw new Error("Not implemented");
  }

  findBy(
    _props: Partial<Conversation["_props"]>,
  ): Promise<Result<Option<Conversation>>> {
    throw new Error("Not implemented");
  }
}
