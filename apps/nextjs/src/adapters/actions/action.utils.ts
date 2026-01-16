import type { Result } from "@packages/ddd-kit";
import type { z } from "zod";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function parseInput<T>(
  schema: z.ZodType<T>,
  input: unknown,
): { success: false; error: string } | { success: true; data: T } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }
  return { success: true, data: parsed.data };
}

export function isParseError<T>(
  result: ActionResult<T>,
): result is { success: false; error: string } {
  return result.success === false;
}

export function toActionResult<T>(result: Result<T>): ActionResult<T> {
  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }
  return { success: true, data: result.getValue() };
}
