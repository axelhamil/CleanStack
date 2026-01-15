import z from "zod";

export const estimateCostInputDtoSchema = z.object({
  text: z.string().min(1),
  model: z.string().optional(),
});

export const estimateCostOutputDtoSchema = z.object({
  estimatedTokens: z.number(),
  estimatedCost: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }),
});

export type IEstimateCostInputDto = z.infer<typeof estimateCostInputDtoSchema>;
export type IEstimateCostOutputDto = z.infer<
  typeof estimateCostOutputDtoSchema
>;
