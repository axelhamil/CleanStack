import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const emailSchema = z
  .email("Invalid email format")
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters")
  .transform((v) => v.toLowerCase().trim());

export class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = emailSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid email");
    }

    return Result.ok(result.data);
  }
}
