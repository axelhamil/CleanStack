import {
  createPaginatedResult,
  DEFAULT_PAGINATION,
  Option,
  type PaginatedResult,
  type PaginationParams,
  Result,
} from "@packages/ddd-kit";
import {
  and,
  type DbClient,
  db,
  desc,
  eq,
  type Transaction,
} from "@packages/drizzle";
import { managedPrompt as managedPromptTable } from "@packages/drizzle/schema";
import {
  type ManagedPromptPersistence,
  managedPromptToDomain,
  managedPromptToPersistence,
  type PromptVariablePersistence,
} from "@/adapters/mappers/llm/managed-prompt.mapper";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import type { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";

type DrizzleManagedPromptRecord = typeof managedPromptTable.$inferSelect;

function toManagedPromptPersistence(
  record: DrizzleManagedPromptRecord,
): ManagedPromptPersistence {
  return {
    ...record,
    variables: record.variables as PromptVariablePersistence[],
  };
}

export class DrizzleManagedPromptRepository
  implements IManagedPromptRepository
{
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  async create(
    prompt: ManagedPrompt,
    trx?: Transaction,
  ): Promise<Result<ManagedPrompt>> {
    try {
      const data = managedPromptToPersistence(prompt);
      await this.getDb(trx)
        .insert(managedPromptTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(prompt);
    } catch (error) {
      return Result.fail(`Failed to create managed prompt: ${error}`);
    }
  }

  async update(
    prompt: ManagedPrompt,
    trx?: Transaction,
  ): Promise<Result<ManagedPrompt>> {
    try {
      const data = managedPromptToPersistence(prompt);
      await this.getDb(trx)
        .update(managedPromptTable)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(managedPromptTable.id, String(prompt.id.value)));
      return Result.ok(prompt);
    } catch (error) {
      return Result.fail(`Failed to update managed prompt: ${error}`);
    }
  }

  async delete(
    id: ManagedPromptId,
    trx?: Transaction,
  ): Promise<Result<ManagedPromptId>> {
    try {
      await this.getDb(trx)
        .delete(managedPromptTable)
        .where(eq(managedPromptTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete managed prompt: ${error}`);
    }
  }

  async findById(id: ManagedPromptId): Promise<Result<Option<ManagedPrompt>>> {
    try {
      const result = await db
        .select()
        .from(managedPromptTable)
        .where(eq(managedPromptTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const promptResult = managedPromptToDomain(
        toManagedPromptPersistence(record),
      );
      if (promptResult.isFailure) {
        return Result.fail(promptResult.getError());
      }

      return Result.ok(Option.some(promptResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find managed prompt by id: ${error}`);
    }
  }

  async findByKey(
    key: string,
    environment: string,
  ): Promise<Result<Option<ManagedPrompt>>> {
    try {
      const result = await db
        .select()
        .from(managedPromptTable)
        .where(
          and(
            eq(managedPromptTable.key, key),
            eq(
              managedPromptTable.environment,
              environment as "development" | "staging" | "production",
            ),
          ),
        )
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const promptResult = managedPromptToDomain(
        toManagedPromptPersistence(record),
      );
      if (promptResult.isFailure) {
        return Result.fail(promptResult.getError());
      }

      return Result.ok(Option.some(promptResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find managed prompt by key: ${error}`);
    }
  }

  async findActiveByKey(
    key: string,
    environment: string,
  ): Promise<Result<Option<ManagedPrompt>>> {
    try {
      const result = await db
        .select()
        .from(managedPromptTable)
        .where(
          and(
            eq(managedPromptTable.key, key),
            eq(
              managedPromptTable.environment,
              environment as "development" | "staging" | "production",
            ),
            eq(managedPromptTable.isActive, true),
          ),
        )
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const promptResult = managedPromptToDomain(
        toManagedPromptPersistence(record),
      );
      if (promptResult.isFailure) {
        return Result.fail(promptResult.getError());
      }

      return Result.ok(Option.some(promptResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find active managed prompt: ${error}`);
    }
  }

  async getVersionHistory(
    promptId: ManagedPromptId,
  ): Promise<Result<ManagedPrompt[]>> {
    try {
      const basePromptResult = await this.findById(promptId);
      if (basePromptResult.isFailure) {
        return Result.fail(basePromptResult.getError());
      }

      const basePromptOption = basePromptResult.getValue();
      if (basePromptOption.isNone()) {
        return Result.ok([]);
      }

      const basePrompt = basePromptOption.unwrap();
      const key = basePrompt.get("key").value;
      const environment = basePrompt.get("environment").value;

      const records = await db
        .select()
        .from(managedPromptTable)
        .where(
          and(
            eq(managedPromptTable.key, key),
            eq(managedPromptTable.environment, environment),
          ),
        )
        .orderBy(desc(managedPromptTable.version));

      const prompts: ManagedPrompt[] = [];
      for (const record of records) {
        const promptResult = managedPromptToDomain(
          toManagedPromptPersistence(record),
        );
        if (promptResult.isFailure) {
          return Result.fail(promptResult.getError());
        }
        prompts.push(promptResult.getValue());
      }

      return Result.ok(prompts);
    } catch (error) {
      return Result.fail(`Failed to get version history: ${error}`);
    }
  }

  async activateVersion(
    promptId: ManagedPromptId,
    version: number,
    trx?: Transaction,
  ): Promise<Result<void>> {
    try {
      const basePromptResult = await this.findById(promptId);
      if (basePromptResult.isFailure) {
        return Result.fail(basePromptResult.getError());
      }

      const basePromptOption = basePromptResult.getValue();
      if (basePromptOption.isNone()) {
        return Result.fail("Prompt not found");
      }

      const basePrompt = basePromptOption.unwrap();
      const key = basePrompt.get("key").value;
      const environment = basePrompt.get("environment").value;

      const database = this.getDb(trx);

      await database
        .update(managedPromptTable)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(managedPromptTable.key, key),
            eq(managedPromptTable.environment, environment),
          ),
        );

      await database
        .update(managedPromptTable)
        .set({ isActive: true, updatedAt: new Date() })
        .where(
          and(
            eq(managedPromptTable.key, key),
            eq(managedPromptTable.environment, environment),
            eq(managedPromptTable.version, version),
          ),
        );

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(`Failed to activate version: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<ManagedPrompt>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db
          .select()
          .from(managedPromptTable)
          .limit(pagination.limit)
          .offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const prompts: ManagedPrompt[] = [];
      for (const record of records) {
        const promptResult = managedPromptToDomain(
          toManagedPromptPersistence(record),
        );
        if (promptResult.isFailure) {
          return Result.fail(promptResult.getError());
        }
        prompts.push(promptResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(prompts, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all managed prompts: ${error}`);
    }
  }

  async exists(id: ManagedPromptId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: managedPromptTable.id })
        .from(managedPromptTable)
        .where(eq(managedPromptTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check managed prompt existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(managedPromptTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count managed prompts: ${error}`);
    }
  }

  async findMany(
    props: Partial<ManagedPrompt["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<ManagedPrompt>>> {
    try {
      const key = props.key;
      const environment = props.environment;

      if (key && environment) {
        const result = await this.findByKey(key.value, environment.value);
        if (result.isFailure) {
          return Result.fail(result.getError());
        }

        const option = result.getValue();
        if (option.isNone()) {
          return Result.ok(createPaginatedResult([], pagination, 0));
        }

        return Result.ok(
          createPaginatedResult([option.unwrap()], pagination, 1),
        );
      }

      return this.findAll(pagination);
    } catch (error) {
      return Result.fail(`Failed to find managed prompts: ${error}`);
    }
  }

  async findBy(
    props: Partial<ManagedPrompt["_props"]>,
  ): Promise<Result<Option<ManagedPrompt>>> {
    try {
      const key = props.key;
      const environment = props.environment;

      if (key && environment) {
        return this.findByKey(key.value, environment.value);
      }

      return Result.ok(Option.none());
    } catch (error) {
      return Result.fail(`Failed to find managed prompt: ${error}`);
    }
  }
}
