import z from "zod";

export const rollbackManagedPromptInputDtoSchema = z.object({
  promptId: z.string(),
  targetVersion: z.number().int().positive(),
});

export const rollbackManagedPromptOutputDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  currentVersion: z.number(),
  rolledBackFrom: z.number(),
  updatedAt: z.string(),
});

export type IRollbackManagedPromptInputDto = z.infer<
  typeof rollbackManagedPromptInputDtoSchema
>;
export type IRollbackManagedPromptOutputDto = z.infer<
  typeof rollbackManagedPromptOutputDtoSchema
>;
