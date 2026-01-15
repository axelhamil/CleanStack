import z from "zod";
import { capabilitySchema } from "./common.dto";

export const selectOptimalModelInputDtoSchema = z.object({
  capabilities: z.array(capabilitySchema),
  maxBudget: z.number().positive().optional(),
  preferredProviders: z.array(z.string()).optional(),
  strategy: z.enum(["cheapest", "fastest", "round-robin"]).optional(),
});

export const selectOptimalModelOutputDtoSchema = z.object({
  provider: z.string(),
  model: z.string(),
  estimatedCostPer1kTokens: z.object({
    input: z.number(),
    output: z.number(),
  }),
});

export type ISelectOptimalModelInputDto = z.infer<
  typeof selectOptimalModelInputDtoSchema
>;
export type ISelectOptimalModelOutputDto = z.infer<
  typeof selectOptimalModelOutputDtoSchema
>;
