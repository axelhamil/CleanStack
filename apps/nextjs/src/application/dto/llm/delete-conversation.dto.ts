import z from "zod";

export const deleteConversationInputDtoSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
});

export const deleteConversationOutputDtoSchema = z.object({
  success: z.boolean(),
  deletedAt: z.string(),
});

export type IDeleteConversationInputDto = z.infer<
  typeof deleteConversationInputDtoSchema
>;
export type IDeleteConversationOutputDto = z.infer<
  typeof deleteConversationOutputDtoSchema
>;
