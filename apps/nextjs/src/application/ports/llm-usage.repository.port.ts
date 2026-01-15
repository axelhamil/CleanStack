import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import type { LLMUsageId } from "@/domain/llm/usage/llm-usage-id";

export interface IUsageStatsParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: "day" | "week" | "month" | "provider" | "model";
}

export interface IUsageStatsBreakdown {
  period?: string;
  provider?: string;
  model?: string;
  cost: number;
  tokens: number;
  requests: number;
}

export interface IUsageStats {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  breakdown: IUsageStatsBreakdown[];
}

export interface ILLMUsageRepository extends BaseRepository<LLMUsage> {
  findById(id: LLMUsageId): Promise<Result<Option<LLMUsage>>>;
  getTotalCostByUser(
    userId: string,
    period: "day" | "month",
  ): Promise<Result<number>>;
  getTotalCostGlobal(period: "day" | "month"): Promise<Result<number>>;
  getUsageStats(params: IUsageStatsParams): Promise<Result<IUsageStats>>;
}
