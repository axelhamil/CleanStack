import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z
  .string()
  .max(1000, "Prompt description must be at most 1000 characters")
  .transform((val) => val.trim());

export class PromptDescription extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid prompt description");
    }
    return Result.ok(result.data);
  }
}
