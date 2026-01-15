import z from "zod";

export const createPortalSessionInputDtoSchema = z.object({
  userId: z.string(),
  returnUrl: z.string().url(),
});

export const createPortalSessionOutputDtoSchema = z.object({
  url: z.string().url(),
});

export type ICreatePortalSessionInputDto = z.infer<
  typeof createPortalSessionInputDtoSchema
>;
export type ICreatePortalSessionOutputDto = z.infer<
  typeof createPortalSessionOutputDtoSchema
>;
