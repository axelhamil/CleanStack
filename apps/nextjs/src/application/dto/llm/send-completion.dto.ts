import z from "zod";
import {
  capabilitySchema,
  completionBaseInputSchema,
  completionOptionsSchema,
  costDtoSchema,
  usageDtoSchema,
} from "./common.dto";

export const sendCompletionInputDtoSchema = completionBaseInputSchema.extend({
  options: completionOptionsSchema
    .extend({ capabilities: z.array(capabilitySchema).optional() })
    .optional(),
});

export const sendCompletionOutputDtoSchema = z.object({
  content: z.string(),
  model: z.string(),
  provider: z.string(),
  usage: usageDtoSchema,
  cost: costDtoSchema,
});

export type ISendCompletionInputDto = z.infer<
  typeof sendCompletionInputDtoSchema
>;
export type ISendCompletionOutputDto = z.infer<
  typeof sendCompletionOutputDtoSchema
>;
