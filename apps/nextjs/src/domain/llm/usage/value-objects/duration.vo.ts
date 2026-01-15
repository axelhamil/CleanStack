import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const durationSchema = z
  .number()
  .int("Duration must be an integer")
  .nonnegative("Duration must be non-negative")
  .finite("Duration must be finite");

export class Duration extends ValueObject<number> {
  protected validate(value: number): Result<number> {
    const result = durationSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid duration");
    }

    return Result.ok(result.data);
  }

  toSeconds(): number {
    return this.value / 1000;
  }

  toHumanReadable(): string {
    if (this.value < 10000) {
      return `${this.value}ms`;
    }
    return `${(this.value / 1000).toFixed(1)}s`;
  }

  static zero(): Result<Duration> {
    const zero: number = 0;
    return Duration.create(zero) as Result<Duration>;
  }
}
