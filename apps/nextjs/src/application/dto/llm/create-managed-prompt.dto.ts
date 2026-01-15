import z from "zod";
import { environmentSchema, promptVariableSchema } from "./common.dto";

export const createManagedPromptInputDtoSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  template: z.string().min(1),
  variables: z.array(promptVariableSchema).optional(),
  environment: environmentSchema,
});

export const createManagedPromptOutputDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  version: z.number(),
  createdAt: z.string(),
});

export type ICreateManagedPromptInputDto = z.infer<
  typeof createManagedPromptInputDtoSchema
>;
export type ICreateManagedPromptOutputDto = z.infer<
  typeof createManagedPromptOutputDtoSchema
>;
