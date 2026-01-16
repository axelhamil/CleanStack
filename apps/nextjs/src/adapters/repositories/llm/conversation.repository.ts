import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  type DbClient,
  db,
  desc,
  eq,
  type Transaction,
} from "@packages/drizzle";
import {
  conversation as conversationTable,
  message as messageTable,
} from "@packages/drizzle/schema";
import {
  type ConversationPersistence,
  conversationToDomain,
  conversationToPersistence,
} from "@/adapters/mappers/llm/conversation.mapper";
import {
  type MessagePersistence,
  messageToDomain,
} from "@/adapters/mappers/llm/message.mapper";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

type DrizzleConversationRecord = typeof conversationTable.$inferSelect;
type DrizzleMessageRecord = typeof messageTable.$inferSelect;

function toConversationPersistence(
  record: DrizzleConversationRecord,
): ConversationPersistence {
  return {
    ...record,
    metadata: record.metadata as Record<string, unknown> | null,
  };
}

function toMessagePersistence(
  record: DrizzleMessageRecord,
): MessagePersistence {
  return {
    ...record,
    costCurrency: record.costCurrency ?? "USD",
  };
}

export class DrizzleConversationRepository implements IConversationRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    conversation: Conversation,
    trx?: Transaction,
  ): Promise<Result<Conversation>> {
    try {
      const data = conversationToPersistence(conversation);
      await this.getDb(trx)
        .insert(conversationTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(conversation);
    } catch (error) {
      return Result.fail(`Failed to create conversation: ${error}`);
    }
  }

  async update(
    conversation: Conversation,
    trx?: Transaction,
  ): Promise<Result<Conversation>> {
    try {
      const data = conversationToPersistence(conversation);
      await this.getDb(trx)
        .update(conversationTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(conversationTable.id, String(conversation.id.value)));
      return Result.ok(conversation);
    } catch (error) {
      return Result.fail(`Failed to update conversation: ${error}`);
    }
  }

  async delete(
    id: ConversationId,
    trx?: Transaction,
  ): Promise<Result<ConversationId>> {
    try {
      await this.getDb(trx)
        .delete(conversationTable)
        .where(eq(conversationTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete conversation: ${error}`);
    }
  }

  async findById(id: ConversationId): Promise<Result<Option<Conversation>>> {
    try {
      const result = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const conversationResult = conversationToDomain(
        toConversationPersistence(record),
      );
      if (conversationResult.isFailure) {
        return Result.fail(conversationResult.getError());
      }

      return Result.ok(Option.some(conversationResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find conversation by id: ${error}`);
    }
  }

  async findByUserId(
    userId: string,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Conversation>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.userId, userId))
        .limit(pagination.limit)
        .offset(offset);

      const conversations: Conversation[] = [];
      for (const record of records) {
        const conversationResult = conversationToDomain(
          toConversationPersistence(record),
        );
        if (conversationResult.isFailure) {
          return Result.fail(conversationResult.getError());
        }
        conversations.push(conversationResult.getValue());
      }

      const countResult = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.userId, userId));

      return Result.ok(
        createPaginatedResult(conversations, pagination, countResult.length),
      );
    } catch (error) {
      return Result.fail(`Failed to find conversations by user id: ${error}`);
    }
  }

  async getWithMessages(
    id: ConversationId,
  ): Promise<
    Result<Option<{ conversation: Conversation; messages: Message[] }>>
  > {
    try {
      const results = await db
        .select()
        .from(conversationTable)
        .leftJoin(
          messageTable,
          eq(conversationTable.id, messageTable.conversationId),
        )
        .where(eq(conversationTable.id, String(id.value)))
        .orderBy(desc(messageTable.createdAt));

      if (results.length === 0) {
        return Result.ok(Option.none());
      }

      const firstRow = results[0];
      if (!firstRow) {
        return Result.ok(Option.none());
      }

      const conversationRecord = firstRow.conversation;
      if (!conversationRecord) {
        return Result.ok(Option.none());
      }

      const conversationResult = conversationToDomain(
        toConversationPersistence(conversationRecord),
      );
      if (conversationResult.isFailure) {
        return Result.fail(conversationResult.getError());
      }

      const messages: Message[] = [];
      for (const row of results) {
        if (row.message) {
          const messageResult = messageToDomain(
            toMessagePersistence(row.message),
          );
          if (messageResult.isFailure) {
            return Result.fail(messageResult.getError());
          }
          messages.push(messageResult.getValue());
        }
      }

      return Result.ok(
        Option.some({
          conversation: conversationResult.getValue(),
          messages,
        }),
      );
    } catch (error) {
      return Result.fail(`Failed to get conversation with messages: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Conversation>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(conversationTable)
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const conversations: Conversation[] = [];
      for (const record of records) {
        const conversationResult = conversationToDomain(
          toConversationPersistence(record),
        );
        if (conversationResult.isFailure) {
          return Result.fail(conversationResult.getError());
        }
        conversations.push(conversationResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(
          conversations,
          pagination,
          countResult.getValue(),
        ),
      );
    } catch (error) {
      return Result.fail(`Failed to find all conversations: ${error}`);
    }
  }

  async exists(id: ConversationId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: conversationTable.id })
        .from(conversationTable)
        .where(eq(conversationTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check conversation existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(conversationTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count conversations: ${error}`);
    }
  }

  async findMany(
    props: Partial<Conversation["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Conversation>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return this.findAll(pagination);
      }
      return this.findByUserId(userId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find conversations: ${error}`);
    }
  }

  async findBy(
    props: Partial<Conversation["_props"]>,
  ): Promise<Result<Option<Conversation>>> {
    try {
      const userId = props.userId;
      if (!userId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(conversationTable)
        .where(eq(conversationTable.userId, userId))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const conversationResult = conversationToDomain(
        toConversationPersistence(record),
      );
      if (conversationResult.isFailure) {
        return Result.fail(conversationResult.getError());
      }

      return Result.ok(Option.some(conversationResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find conversation: ${error}`);
    }
  }
}
