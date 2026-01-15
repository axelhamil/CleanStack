import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const modelSchema = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => v.length >= 1, "Model identifier cannot be empty")
  .refine(
    (v) => v.length <= 200,
    "Model identifier must be at most 200 characters",
  );

export class ModelIdentifier extends ValueObject<string> {
  public constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): Result<string> {
    const result = modelSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid model identifier");
    }

    return Result.ok(result.data);
  }
}
