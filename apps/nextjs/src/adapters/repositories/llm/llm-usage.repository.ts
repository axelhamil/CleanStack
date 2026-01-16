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
  eq,
  gte,
  lt,
  sum,
  type Transaction,
} from "@packages/drizzle";
import { llmUsage as llmUsageTable } from "@packages/drizzle/schema";
import {
  llmUsageToDomain,
  llmUsageToPersistence,
} from "@/adapters/mappers/llm/llm-usage.mapper";
import type {
  ILLMUsageRepository,
  IUsageStats,
  IUsageStatsBreakdown,
  IUsageStatsParams,
} from "@/application/ports/llm-usage.repository.port";
import type { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import type { LLMUsageId } from "@/domain/llm/usage/llm-usage-id";

export class DrizzleLLMUsageRepository implements ILLMUsageRepository {
  private getDb(trx?: Transaction): DbClient | Transaction {
    return trx ?? db;
  }

  private getPeriodBounds(period: "day" | "month"): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (period === "day") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  }

  async create(usage: LLMUsage, trx?: Transaction): Promise<Result<LLMUsage>> {
    try {
      const data = llmUsageToPersistence(usage);
      await this.getDb(trx)
        .insert(llmUsageTable)
        .values({
          ...data,
          createdAt: data.createdAt ?? new Date(),
        });
      return Result.ok(usage);
    } catch (error) {
      return Result.fail(`Failed to create LLM usage: ${error}`);
    }
  }

  async update(usage: LLMUsage, trx?: Transaction): Promise<Result<LLMUsage>> {
    try {
      const data = llmUsageToPersistence(usage);
      await this.getDb(trx)
        .update(llmUsageTable)
        .set(data)
        .where(eq(llmUsageTable.id, String(usage.id.value)));
      return Result.ok(usage);
    } catch (error) {
      return Result.fail(`Failed to update LLM usage: ${error}`);
    }
  }

  async delete(id: LLMUsageId, trx?: Transaction): Promise<Result<LLMUsageId>> {
    try {
      await this.getDb(trx)
        .delete(llmUsageTable)
        .where(eq(llmUsageTable.id, String(id.value)));
      return Result.ok(id);
    } catch (error) {
      return Result.fail(`Failed to delete LLM usage: ${error}`);
    }
  }

  async findById(id: LLMUsageId): Promise<Result<Option<LLMUsage>>> {
    try {
      const result = await db
        .select()
        .from(llmUsageTable)
        .where(eq(llmUsageTable.id, String(id.value)))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const usageResult = llmUsageToDomain(record);
      if (usageResult.isFailure) {
        return Result.fail(usageResult.getError());
      }

      return Result.ok(Option.some(usageResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find LLM usage by id: ${error}`);
    }
  }

  async getTotalCostByUser(
    userId: string,
    period: "day" | "month",
  ): Promise<Result<number>> {
    try {
      const { start, end } = this.getPeriodBounds(period);

      const result = await db
        .select({ total: sum(llmUsageTable.costAmount) })
        .from(llmUsageTable)
        .where(
          and(
            eq(llmUsageTable.userId, userId),
            gte(llmUsageTable.createdAt, start),
            lt(llmUsageTable.createdAt, end),
          ),
        );

      const total = result[0]?.total;
      return Result.ok(total ? Number(total) : 0);
    } catch (error) {
      return Result.fail(`Failed to get total cost by user: ${error}`);
    }
  }

  async getTotalCostGlobal(period: "day" | "month"): Promise<Result<number>> {
    try {
      const { start, end } = this.getPeriodBounds(period);

      const result = await db
        .select({ total: sum(llmUsageTable.costAmount) })
        .from(llmUsageTable)
        .where(
          and(
            gte(llmUsageTable.createdAt, start),
            lt(llmUsageTable.createdAt, end),
          ),
        );

      const total = result[0]?.total;
      return Result.ok(total ? Number(total) : 0);
    } catch (error) {
      return Result.fail(`Failed to get total cost global: ${error}`);
    }
  }

  async getUsageStats(params: IUsageStatsParams): Promise<Result<IUsageStats>> {
    try {
      const conditions = [];

      if (params.userId) {
        conditions.push(eq(llmUsageTable.userId, params.userId));
      }

      if (params.startDate) {
        conditions.push(gte(llmUsageTable.createdAt, params.startDate));
      }

      if (params.endDate) {
        conditions.push(lt(llmUsageTable.createdAt, params.endDate));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const records = await db
        .select()
        .from(llmUsageTable)
        .where(whereClause)
        .groupBy(
          params.groupBy === "provider"
            ? llmUsageTable.provider
            : params.groupBy === "model"
              ? llmUsageTable.model
              : llmUsageTable.createdAt,
        );

      let totalCost = 0;
      let totalTokens = 0;
      let requestCount = 0;

      const breakdownMap = new Map<string, IUsageStatsBreakdown>();

      for (const record of records) {
        const cost = record.costAmount;
        const tokens = record.inputTokens + record.outputTokens;

        totalCost += cost;
        totalTokens += tokens;
        requestCount += 1;

        let key: string;
        let breakdown: Partial<IUsageStatsBreakdown>;

        if (params.groupBy === "provider") {
          key = record.provider;
          breakdown = { provider: record.provider };
        } else if (params.groupBy === "model") {
          key = record.model;
          breakdown = { model: record.model };
        } else {
          key = record.createdAt.toISOString().split("T")[0] ?? "unknown";
          breakdown = { period: key };
        }

        const existing = breakdownMap.get(key);
        if (existing) {
          existing.cost += cost;
          existing.tokens += tokens;
          existing.requests += 1;
        } else {
          breakdownMap.set(key, {
            ...breakdown,
            cost,
            tokens,
            requests: 1,
          });
        }
      }

      return Result.ok({
        totalCost,
        totalTokens,
        requestCount,
        breakdown: Array.from(breakdownMap.values()),
      });
    } catch (error) {
      return Result.fail(`Failed to get usage stats: ${error}`);
    }
  }

  async findAll(
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<LLMUsage>>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit;

      const [records, countResult] = await Promise.all([
        db.select().from(llmUsageTable).limit(pagination.limit).offset(offset),
        this.count(),
      ]);

      if (countResult.isFailure) {
        return Result.fail(countResult.getError());
      }

      const usages: LLMUsage[] = [];
      for (const record of records) {
        const usageResult = llmUsageToDomain(record);
        if (usageResult.isFailure) {
          return Result.fail(usageResult.getError());
        }
        usages.push(usageResult.getValue());
      }

      return Result.ok(
        createPaginatedResult(usages, pagination, countResult.getValue()),
      );
    } catch (error) {
      return Result.fail(`Failed to find all LLM usages: ${error}`);
    }
  }

  async exists(id: LLMUsageId): Promise<Result<boolean>> {
    try {
      const result = await db
        .select({ id: llmUsageTable.id })
        .from(llmUsageTable)
        .where(eq(llmUsageTable.id, String(id.value)))
        .limit(1);
      return Result.ok(result.length > 0);
    } catch (error) {
      return Result.fail(`Failed to check LLM usage existence: ${error}`);
    }
  }

  async count(): Promise<Result<number>> {
    try {
      const result = await db.select().from(llmUsageTable);
      return Result.ok(result.length);
    } catch (error) {
      return Result.fail(`Failed to count LLM usages: ${error}`);
    }
  }

  async findMany(
    props: Partial<LLMUsage["_props"]>,
    pagination: PaginationParams = DEFAULT_PAGINATION,
  ): Promise<Result<PaginatedResult<LLMUsage>>> {
    try {
      const userId = props.userId;
      if (userId?.isNone()) {
        return this.findAll(pagination);
      }

      if (userId?.isSome()) {
        const offset = (pagination.page - 1) * pagination.limit;

        const records = await db
          .select()
          .from(llmUsageTable)
          .where(eq(llmUsageTable.userId, userId.unwrap().value.toString()))
          .limit(pagination.limit)
          .offset(offset);

        const usages: LLMUsage[] = [];
        for (const record of records) {
          const usageResult = llmUsageToDomain(record);
          if (usageResult.isFailure) {
            return Result.fail(usageResult.getError());
          }
          usages.push(usageResult.getValue());
        }

        const totalResult = await db
          .select()
          .from(llmUsageTable)
          .where(eq(llmUsageTable.userId, userId.unwrap().value.toString()));

        return Result.ok(
          createPaginatedResult(usages, pagination, totalResult.length),
        );
      }

      return this.findAll(pagination);
    } catch (error) {
      return Result.fail(`Failed to find LLM usages: ${error}`);
    }
  }

  async findBy(
    props: Partial<LLMUsage["_props"]>,
  ): Promise<Result<Option<LLMUsage>>> {
    try {
      const userId = props.userId;
      if (!userId || userId.isNone()) {
        return Result.ok(Option.none());
      }

      const result = await db
        .select()
        .from(llmUsageTable)
        .where(eq(llmUsageTable.userId, userId.unwrap().value.toString()))
        .limit(1);

      const record = result[0];
      if (!record) {
        return Result.ok(Option.none());
      }

      const usageResult = llmUsageToDomain(record);
      if (usageResult.isFailure) {
        return Result.fail(usageResult.getError());
      }

      return Result.ok(Option.some(usageResult.getValue()));
    } catch (error) {
      return Result.fail(`Failed to find LLM usage: ${error}`);
    }
  }
}
