import z from "zod";
import { promptVariableSchema } from "./common.dto";

export const updateManagedPromptInputDtoSchema = z.object({
  promptId: z.string(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  template: z.string().min(1).optional(),
  variables: z.array(promptVariableSchema).optional(),
});

export const updateManagedPromptOutputDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  version: z.number(),
  updatedAt: z.string(),
});

export type IUpdateManagedPromptInputDto = z.infer<
  typeof updateManagedPromptInputDtoSchema
>;
export type IUpdateManagedPromptOutputDto = z.infer<
  typeof updateManagedPromptOutputDtoSchema
>;
