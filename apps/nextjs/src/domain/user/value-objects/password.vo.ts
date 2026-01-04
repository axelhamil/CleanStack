import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters");

export class Password extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = passwordSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid password");
    }

    return Result.ok(result.data);
  }
}
