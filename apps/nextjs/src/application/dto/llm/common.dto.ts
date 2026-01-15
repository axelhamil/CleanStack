import z from "zod";

export const providerSchema = z.enum(["openai", "anthropic", "google"]);

export const messageRoleSchema = z.enum(["user", "assistant", "system"]);

export const environmentSchema = z.enum([
  "development",
  "staging",
  "production",
]);

export const capabilitySchema = z.enum(["text", "json", "vision"]);

export const usageDtoSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
});

export const costDtoSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const messageDtoSchema = z.object({
  id: z.string(),
  role: messageRoleSchema,
  content: z.string(),
  createdAt: z.string(),
});

export const paginationInputSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
});

export const paginationOutputSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const promptVariableSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean"]),
  required: z.boolean(),
  defaultValue: z.string().optional(),
});

export type IProviderType = z.infer<typeof providerSchema>;
export type IMessageRole = z.infer<typeof messageRoleSchema>;
export type IEnvironmentType = z.infer<typeof environmentSchema>;
export type ICapabilityType = z.infer<typeof capabilitySchema>;
export type IUsageDto = z.infer<typeof usageDtoSchema>;
export type ICostDto = z.infer<typeof costDtoSchema>;
export type IMessageDto = z.infer<typeof messageDtoSchema>;
export type IPaginationInput = z.infer<typeof paginationInputSchema>;
export type IPaginationOutput = z.infer<typeof paginationOutputSchema>;
export type IPromptVariable = z.infer<typeof promptVariableSchema>;
