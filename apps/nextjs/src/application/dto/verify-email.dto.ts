import z from "zod";

export const verifyEmailInputDtoSchema = z.object({
  userId: z.string(),
});

export type IVerifyEmailInputDto = z.infer<typeof verifyEmailInputDtoSchema>;
