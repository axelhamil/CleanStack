import z from "zod";
import {
  messageDtoSchema,
  paginationInputSchema,
  paginationOutputSchema,
} from "./common.dto";

export const listMessagesInputDtoSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  pagination: paginationInputSchema.optional(),
});

export const listMessagesOutputDtoSchema = z.object({
  messages: z.array(messageDtoSchema),
  pagination: paginationOutputSchema,
});

export type IListMessagesInputDto = z.infer<typeof listMessagesInputDtoSchema>;
export type IListMessagesOutputDto = z.infer<
  typeof listMessagesOutputDtoSchema
>;
