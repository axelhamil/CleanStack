import { type Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";
import { validateWithZod } from "@/domain/_shared/validation.helper";

const schema = z
  .string()
  .min(1, "Prompt key must not be empty")
  .max(100, "Prompt key must be at most 100 characters")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Prompt key must be lowercase letters, numbers, and hyphens only (slug format)",
  );

export class PromptKey extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    return validateWithZod(schema, value, "Invalid prompt key");
  }
}
