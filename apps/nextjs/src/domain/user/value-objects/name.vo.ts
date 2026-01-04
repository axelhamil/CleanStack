import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .transform((v) => v.trim());

export class Name extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = nameSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid name");
    }

    return Result.ok(result.data);
  }
}
