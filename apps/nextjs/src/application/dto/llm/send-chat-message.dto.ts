import z from "zod";
import { providerSchema } from "./common.dto";

export const sendChatMessageInputDtoSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  systemPrompt: z.string().optional(),
  userId: z.string(),
  options: z
    .object({
      maxBudget: z.number().positive().optional(),
      providers: z.array(providerSchema).optional(),
      stream: z.boolean().optional(),
    })
    .optional(),
});

export const sendChatMessageOutputDtoSchema = z.object({
  conversationId: z.string(),
  message: z.object({
    id: z.string(),
    role: z.literal("assistant"),
    content: z.string(),
  }),
  usage: z.object({
    inputTokens: z.number(),
    outputTokens: z.number(),
    cost: z.number(),
  }),
});

export type ISendChatMessageInputDto = z.infer<
  typeof sendChatMessageInputDtoSchema
>;
export type ISendChatMessageOutputDto = z.infer<
  typeof sendChatMessageOutputDtoSchema
>;
