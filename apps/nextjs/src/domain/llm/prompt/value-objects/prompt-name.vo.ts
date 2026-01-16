import { type Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";
import { validateWithZod } from "@/domain/_shared/validation.helper";

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
    return validateWithZod(schema, value, "Invalid prompt name");
  }
}
