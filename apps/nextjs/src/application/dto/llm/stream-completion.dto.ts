import z from "zod";
import { providerSchema } from "./common.dto";

export const streamCompletionInputDtoSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  variables: z.record(z.string(), z.string()).optional(),
  options: z
    .object({
      maxBudget: z.number().positive().optional(),
      providers: z.array(providerSchema).optional(),
      temperature: z.number().min(0).max(2).optional(),
      maxTokens: z.number().positive().optional(),
    })
    .optional(),
  userId: z.string().optional(),
  conversationId: z.string().optional(),
});

export const streamCompletionOutputDtoSchema = z.object({
  stream: z.custom<ReadableStream<string>>(
    (val) => val instanceof ReadableStream,
  ),
  model: z.string(),
  provider: z.string(),
});

export type IStreamCompletionInputDto = z.infer<
  typeof streamCompletionInputDtoSchema
>;
export type IStreamCompletionOutputDto = z.infer<
  typeof streamCompletionOutputDtoSchema
>;
