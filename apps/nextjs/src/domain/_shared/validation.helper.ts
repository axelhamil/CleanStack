import { Result } from "@packages/ddd-kit";
import type { z } from "zod";

export function validateWithZod<T>(
  schema: z.ZodType<T>,
  value: unknown,
  fallbackMessage: string,
): Result<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    return Result.fail(result.error.issues[0]?.message ?? fallbackMessage);
  }
  return Result.ok(result.data);
}
