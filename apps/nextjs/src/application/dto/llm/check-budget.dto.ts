import z from "zod";

export const checkBudgetInputDtoSchema = z.object({
  userId: z.string().optional(),
  estimatedCost: z.number().optional(),
});

export const checkBudgetOutputDtoSchema = z.object({
  canProceed: z.boolean(),
  remainingBudget: z.object({
    daily: z.number(),
    monthly: z.number(),
  }),
  limits: z.object({
    dailyLimit: z.number(),
    monthlyLimit: z.number(),
  }),
  usage: z.object({
    dailyUsed: z.number(),
    monthlyUsed: z.number(),
  }),
});

export type ICheckBudgetInputDto = z.infer<typeof checkBudgetInputDtoSchema>;
export type ICheckBudgetOutputDto = z.infer<typeof checkBudgetOutputDtoSchema>;
