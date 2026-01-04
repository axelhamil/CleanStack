import z from "zod";

export const signOutInputDtoSchema = z.object({
  sessionToken: z.string(),
});

export type ISignOutInputDto = z.infer<typeof signOutInputDtoSchema>;
