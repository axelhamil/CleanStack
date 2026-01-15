import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const planIdSchema = z
  .string()
  .min(1, "Plan ID is required")
  .max(100, "Plan ID must be less than 100 characters");

export class PlanId extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = planIdSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid plan ID");
    }

    return Result.ok(result.data);
  }
}
