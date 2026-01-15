import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const tokenCountSchema = z
  .number()
  .int("Token count must be an integer")
  .nonnegative("Token count must be non-negative")
  .finite("Token count must be finite");

export class TokenCount extends ValueObject<number> {
  protected validate(value: number): Result<number> {
    const result = tokenCountSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid token count");
    }

    return Result.ok(result.data);
  }

  add(other: TokenCount): Result<TokenCount> {
    return TokenCount.create(this.value + other.value) as Result<TokenCount>;
  }

  static zero(): Result<TokenCount> {
    const zero: number = 0;
    return TokenCount.create(zero) as Result<TokenCount>;
  }
}
