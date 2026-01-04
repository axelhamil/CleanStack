import z from "zod";
import { sessionDtoSchema, userDtoSchema } from "@/application/dto/common.dto";

export const getSessionOutputDtoSchema = z.object({
  user: userDtoSchema,
  session: sessionDtoSchema,
});

export type IGetSessionOutputDto = z.infer<typeof getSessionOutputDtoSchema>;
