import z from "zod";

export const getUsageStatsInputDtoSchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(["day", "week", "month", "provider", "model"]).optional(),
});

export const usageBreakdownDtoSchema = z.object({
  period: z.string().optional(),
  provider: z.string().optional(),
  model: z.string().optional(),
  cost: z.number(),
  tokens: z.number(),
  requests: z.number(),
});

export const budgetStatusDtoSchema = z.object({
  dailyUsed: z.number(),
  dailyLimit: z.number(),
  monthlyUsed: z.number(),
  monthlyLimit: z.number(),
});

export const getUsageStatsOutputDtoSchema = z.object({
  totalCost: z.number(),
  totalTokens: z.number(),
  requestCount: z.number(),
  breakdown: z.array(usageBreakdownDtoSchema),
  budgetStatus: budgetStatusDtoSchema,
});

export type IGetUsageStatsInputDto = z.infer<
  typeof getUsageStatsInputDtoSchema
>;
export type IUsageBreakdownDto = z.infer<typeof usageBreakdownDtoSchema>;
export type IBudgetStatusDto = z.infer<typeof budgetStatusDtoSchema>;
export type IGetUsageStatsOutputDto = z.infer<
  typeof getUsageStatsOutputDtoSchema
>;
