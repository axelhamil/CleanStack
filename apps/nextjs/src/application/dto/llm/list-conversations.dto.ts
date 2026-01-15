import z from "zod";
import { paginationInputSchema, paginationOutputSchema } from "./common.dto";

export const listConversationsInputDtoSchema = z.object({
  userId: z.string(),
  pagination: paginationInputSchema.optional(),
});

export const conversationSummaryDtoSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  lastMessage: z.string().nullable(),
  messageCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export const listConversationsOutputDtoSchema = z.object({
  conversations: z.array(conversationSummaryDtoSchema),
  pagination: paginationOutputSchema,
});

export type IListConversationsInputDto = z.infer<
  typeof listConversationsInputDtoSchema
>;
export type IConversationSummaryDto = z.infer<
  typeof conversationSummaryDtoSchema
>;
export type IListConversationsOutputDto = z.infer<
  typeof listConversationsOutputDtoSchema
>;
