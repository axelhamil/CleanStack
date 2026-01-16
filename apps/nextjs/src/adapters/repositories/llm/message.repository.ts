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
import { message as messageTable } from "@packages/drizzle/schema";
import {
  type MessagePersistence,
  messageToDomain,
  messageToPersistence,
} from "@/adapters/mappers/llm/message.mapper";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";
import type { MessageId } from "@/domain/llm/conversation/entities/message-id";

type DrizzleMessageRecord = typeof messageTable.$inferSelect;

function toMessagePersistence(
  record: DrizzleMessageRecord,
): MessagePersistence {
  return {
    ...record,
    costCurrency: record.costCurrency ?? "USD",
  };
}

export class DrizzleMessageRepository implements IMessageRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(message: Message, trx?: Transaction): Promise<Result<Message>> {
    try {
      const data = messageToPersistence(message);
      await this.getDb(trx)
        .insert(messageTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(message);
    } catch (error) {
      return Result.fail(`Failed to create message: ${error}`);
    }
  }

  async update(message: Message, trx?: Transaction): Promise<Result<Message>> {
    try {
      const data = messageToPersistence(message);
      await this.getDb(trx)
        .update(messageTable)
        .set(data)
        .where(eq(messageTable.id, String(message.id.value)));
      return Result.ok(message);
    } catch (error) {
      return Result.fail(`Failed to update message: ${error}`);
    }
  }

  async delete(id: MessageId, trx?: Transaction): Promise<Result<MessageId>> {
    try {
      await this.getDb(trx)
        .delete(messageTable)
        .where(eq(messageTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete message: ${error}`);
    }
  }

  async findById(id: MessageId): Promise<Result<Option<Message>>> {
    try {
      const result = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const messageResult = messageToDomain(toMessagePersistence(record));
      if (messageResult.isFailure) {
        return Result.fail(messageResult.getError());
      }

      return Result.ok(Option.some(messageResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find message by id: ${error}`);
    }
  }

  async findByConversationId(
    conversationId: ConversationId,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Message>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const records = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.conversationId, String(conversationId.value)))
        .limit(pagination.limit)
        .offset(offset)
        .orderBy(desc(messageTable.createdAt));

      const messages: Message[] = [];
      for (const record of records) {
        const messageResult = messageToDomain(toMessagePersistence(record));
        if (messageResult.isFailure) {
          return Result.fail(messageResult.getError());
        }
        messages.push(messageResult.getValue());
      }

      const countResult = await this.countByConversationId(conversationId);
      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      return Result.ok(
        createPaginatedResult(messages, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(
        `Failed to find messages by conversation id: ${error}`,
      );
    }
  }

  async countByConversationId(
    conversationId: ConversationId,
  ): Promise<Result<number>> {
    try {
      const result = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.conversationId, String(conversationId.value)));
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(
        `Failed to count messages by conversation id: ${error}`,
      );
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Message>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db.select().from(messageTable).limit(pagination.limit).offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const messages: Message[] = [];
      for (const record of records) {
        const messageResult = messageToDomain(toMessagePersistence(record));
        if (messageResult.isFailure) {
          return Result.fail(messageResult.getError());
        }
        messages.push(messageResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(messages, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all messages: ${error}`);
    }
  }

  async exists(id: MessageId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: messageTable.id })
        .from(messageTable)
        .where(eq(messageTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check message existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(messageTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count messages: ${error}`);
    }
  }

  async findMany(
    props: Partial<Message["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<Message>>> {
    try {
      const conversationId = props.conversationId;
      if (!conversationId) {
        return this.findAll(pagination);
      }
      return this.findByConversationId(conversationId, pagination);
    } catch (error) {
      return Result.fail(`Failed to find messages: ${error}`);
    }
  }

  async findBy(
    props: Partial<Message["_props"]>,
  ): Promise<Result<Option<Message>>> {
    try {
      const conversationId = props.conversationId;
      if (!conversationId) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(messageTable)
        .where(eq(messageTable.conversationId, String(conversationId.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const messageResult = messageToDomain(toMessagePersistence(record));
      if (messageResult.isFailure) {
        return Result.fail(messageResult.getError());
      }

      return Result.ok(Option.some(messageResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find message: ${error}`);
    }
  }
}
