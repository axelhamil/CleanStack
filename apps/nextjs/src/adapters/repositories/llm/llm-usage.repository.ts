import type { Option, PaginatedResult, Result } from "@packages/ddd-kit";
import type {
  ILLMUsageRepository,
  IUsageStats,
  IUsageStatsParams,
} from "@/application/ports/llm-usage.repository.port";
import type { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import type { LLMUsageId } from "@/domain/llm/usage/llm-usage-id";

/**
 * Drizzle implementation of ILLMUsageRepository
 * TDD: Stub for RED phase - implement in GREEN phase
 */
export class DrizzleLLMUsageRepository implements ILLMUsageRepository {
  create(_usage: LLMUsage): Promise<Result<LLMUsage>> {
    throw new Error("Not implemented");
  }

  update(_usage: LLMUsage): Promise<Result<LLMUsage>> {
    throw new Error("Not implemented");
  }

  delete(_id: LLMUsageId): Promise<Result<LLMUsageId>> {
    throw new Error("Not implemented");
  }

  findById(_id: LLMUsageId): Promise<Result<Option<LLMUsage>>> {
    throw new Error("Not implemented");
  }

  getTotalCostByUser(
    _userId: string,
    _period: "day" | "month",
  ): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  getTotalCostGlobal(_period: "day" | "month"): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  getUsageStats(_params: IUsageStatsParams): Promise<Result<IUsageStats>> {
    throw new Error("Not implemented");
  }

  findAll(_pagination?: {
    page: number;
    limit: number;
  }): Promise<Result<PaginatedResult<LLMUsage>>> {
    throw new Error("Not implemented");
  }

  exists(_id: LLMUsageId): Promise<Result<boolean>> {
    throw new Error("Not implemented");
  }

  count(): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  findMany(
    _props: Partial<LLMUsage["_props"]>,
    _pagination?: { page: number; limit: number },
  ): Promise<Result<PaginatedResult<LLMUsage>>> {
    throw new Error("Not implemented");
  }

  findBy(
    _props: Partial<LLMUsage["_props"]>,
  ): Promise<Result<Option<LLMUsage>>> {
    throw new Error("Not implemented");
  }
}
