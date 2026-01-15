import z from "zod";

export const createCheckoutSessionInputDtoSchema = z.object({
  userId: z.string(),
  priceId: z.string(),
  baseUrl: z.string().url(),
});

export const createCheckoutSessionOutputDtoSchema = z.object({
  url: z.string().url(),
});

export type ICreateCheckoutSessionInputDto = z.infer<
  typeof createCheckoutSessionInputDtoSchema
>;
export type ICreateCheckoutSessionOutputDto = z.infer<
  typeof createCheckoutSessionOutputDtoSchema
>;
