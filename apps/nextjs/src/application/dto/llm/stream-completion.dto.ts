import z from "zod";
import {
  completionBaseInputSchema,
  completionOptionsSchema,
} from "./common.dto";

export const streamCompletionInputDtoSchema = completionBaseInputSchema.extend({
  options: completionOptionsSchema.optional(),
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
