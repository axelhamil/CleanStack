import z from "zod";
import { costDtoSchema, usageDtoSchema } from "./common.dto";

export const testManagedPromptInputDtoSchema = z.object({
  promptId: z.string(),
  variables: z.record(z.string(), z.string()),
  provider: z.string().optional(),
  model: z.string().optional(),
});

export const testManagedPromptOutputDtoSchema = z.object({
  renderedPrompt: z.string(),
  response: z.string(),
  model: z.string(),
  provider: z.string(),
  usage: usageDtoSchema,
  cost: costDtoSchema,
});

export type ITestManagedPromptInputDto = z.infer<
  typeof testManagedPromptInputDtoSchema
>;
export type ITestManagedPromptOutputDto = z.infer<
  typeof testManagedPromptOutputDtoSchema
>;
