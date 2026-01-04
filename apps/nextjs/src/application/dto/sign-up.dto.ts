import z from "zod";
import { userDtoSchema } from "@/application/dto/common.dto";

export const signUpInputDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
  image: z.string().optional(),
});

export const signUpOutputDtoSchema = z.object({
  user: userDtoSchema,
  token: z.string(),
});

export type ISignUpInputDto = z.infer<typeof signUpInputDtoSchema>;
export type ISignUpOutputDto = z.infer<typeof signUpOutputDtoSchema>;
