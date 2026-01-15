import z from "zod";
import { messageDtoSchema } from "./common.dto";

export const getConversationInputDtoSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
});

export const getConversationOutputDtoSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  messages: z.array(messageDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IGetConversationInputDto = z.infer<
  typeof getConversationInputDtoSchema
>;
export type IGetConversationOutputDto = z.infer<
  typeof getConversationOutputDtoSchema
>;
