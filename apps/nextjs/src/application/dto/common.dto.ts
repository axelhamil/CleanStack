import z from "zod";

export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
});

export const sessionDtoSchema = z.object({
  id: z.string(),
  token: z.string(),
  expiresAt: z.date(),
});

export type IUserDto = z.infer<typeof userDtoSchema>;
export type ISessionDto = z.infer<typeof sessionDtoSchema>;
