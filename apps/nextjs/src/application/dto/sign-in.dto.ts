import z from "zod";
import { userDtoSchema } from "@/application/dto/common.dto";

export const signInInputDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const signInOutputDtoSchema = z.object({
  user: userDtoSchema,
  token: z.string(),
});

export type ISignInInputDto = z.infer<typeof signInInputDtoSchema>;
export type ISignInOutputDto = z.infer<typeof signInOutputDtoSchema>;
