import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export type PromptEnvironmentType = "development" | "staging" | "production";

const schema = z.enum(["development", "staging", "production"]);

export class PromptEnvironment extends ValueObject<PromptEnvironmentType> {
  protected validate(
    value: PromptEnvironmentType,
  ): Result<PromptEnvironmentType> {
    const result = schema.safeParse(value);
    if (!result.success) {
      return Result.fail(
        "Invalid environment. Must be 'development', 'staging', or 'production'",
      );
    }
    return Result.ok(result.data);
  }

  isDevelopment(): boolean {
    return this.value === "development";
  }

  isStaging(): boolean {
    return this.value === "staging";
  }

  isProduction(): boolean {
    return this.value === "production";
  }
}
