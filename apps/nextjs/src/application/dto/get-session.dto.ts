import z from "zod";
import { sessionDtoSchema, userDtoSchema } from "@/application/dto/common.dto";

export const getSessionInputDtoSchema = z.object({
  sessionToken: z.string(),
});

export const getSessionOutputDtoSchema = z.object({
  user: userDtoSchema,
  session: sessionDtoSchema,
});

export type IGetSessionInputDto = z.infer<typeof getSessionInputDtoSchema>;
export type IGetSessionOutputDto = z.infer<typeof getSessionOutputDtoSchema>;
