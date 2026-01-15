import z from "zod";
import {
  environmentSchema,
  paginationInputSchema,
  paginationOutputSchema,
} from "./common.dto";

export const listManagedPromptsInputDtoSchema = z.object({
  environment: environmentSchema.optional(),
  search: z.string().optional(),
  pagination: paginationInputSchema.optional(),
});

export const managedPromptSummaryDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  version: z.number(),
  isActive: z.boolean(),
  environment: environmentSchema,
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const listManagedPromptsOutputDtoSchema = z.object({
  prompts: z.array(managedPromptSummaryDtoSchema),
  pagination: paginationOutputSchema,
});

export type IListManagedPromptsInputDto = z.infer<
  typeof listManagedPromptsInputDtoSchema
>;
export type IManagedPromptSummaryDto = z.infer<
  typeof managedPromptSummaryDtoSchema
>;
export type IListManagedPromptsOutputDto = z.infer<
  typeof listManagedPromptsOutputDtoSchema
>;
