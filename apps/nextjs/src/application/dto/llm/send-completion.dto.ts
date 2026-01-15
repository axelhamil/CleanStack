import z from "zod";
import {
  capabilitySchema,
  costDtoSchema,
  providerSchema,
  usageDtoSchema,
} from "./common.dto";

export const sendCompletionInputDtoSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  options: z
    .object({
      maxBudget: z.number().positive().optional(),
      providers: z.array(providerSchema).optional(),
      capabilities: z.array(capabilitySchema).optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
    })
    .optional(),
  userId: z.string().optional(),
  conversationId: z.string().optional(),
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
