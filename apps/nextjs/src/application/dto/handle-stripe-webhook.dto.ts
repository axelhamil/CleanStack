import z from "zod";

export const handleStripeWebhookInputDtoSchema = z.object({
  payload: z.string(),
  signature: z.string(),
});

export const handleStripeWebhookOutputDtoSchema = z.object({
  received: z.literal(true),
});

export type IHandleStripeWebhookInputDto = z.infer<
  typeof handleStripeWebhookInputDtoSchema
>;
export type IHandleStripeWebhookOutputDto = z.infer<
  typeof handleStripeWebhookOutputDtoSchema
>;
