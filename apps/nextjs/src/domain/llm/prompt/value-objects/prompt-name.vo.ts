import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .min(1, "Prompt name must not be empty")
  .max(200, "Prompt name must be at most 200 characters")
  .transform((val) => val.trim())
  .refine(
    (val) => val.length > 0,
    "Prompt name must not be empty after trimming",
  );

export class PromptName extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid prompt name");
    }
    return Result.ok(result.data);
  }
}
