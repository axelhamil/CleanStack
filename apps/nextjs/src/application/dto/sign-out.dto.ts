import z from "zod";
import { sessionDtoSchema, userDtoSchema } from "@/application/dto/common.dto";

export const signOutOutputDtoSchema = z.object({
  user: userDtoSchema,
  session: sessionDtoSchema,
});

export type ISignOutOutputDto = z.infer<typeof signOutOutputDtoSchema>;
