import z from "zod";
import { environmentSchema, promptVariableSchema } from "./common.dto";

export const getManagedPromptInputDtoSchema = z.object({
  key: z.string(),
  environment: environmentSchema,
});

export const getManagedPromptOutputDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  template: z.string(),
  variables: z.array(promptVariableSchema),
  version: z.number(),
  isActive: z.boolean(),
  environment: environmentSchema,
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IGetManagedPromptInputDto = z.infer<
  typeof getManagedPromptInputDtoSchema
>;
export type IGetManagedPromptOutputDto = z.infer<
  typeof getManagedPromptOutputDtoSchema
>;
