import { type Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";
import { validateWithZod } from "@/domain/_shared/validation.helper";

const schema = z
  .string()
  .max(1000, "Prompt description must be at most 1000 characters")
  .transform((val) => val.trim());

export class PromptDescription extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): Result<string> {
    return validateWithZod(schema, value, "Invalid prompt description");
  }
}
