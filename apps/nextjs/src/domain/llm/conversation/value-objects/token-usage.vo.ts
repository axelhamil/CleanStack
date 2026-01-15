import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const tokenUsageSchema = z.object({
  inputTokens: z
    .number()
    .int()
    .nonnegative("Input tokens must be non-negative"),
  outputTokens: z
    .number()
    .int()
    .nonnegative("Output tokens must be non-negative"),
  totalTokens: z
    .number()
    .int()
    .nonnegative("Total tokens must be non-negative"),
});

export interface TokenUsageValue {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export class TokenUsage extends ValueObject<TokenUsageValue> {
  protected validate(value: TokenUsageValue): Result<TokenUsageValue> {
    const result = tokenUsageSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid token usage");
    }

    return Result.ok(result.data);
  }

  get inputTokens(): number {
    return this.value.inputTokens;
  }

  get outputTokens(): number {
    return this.value.outputTokens;
  }

  get totalTokens(): number {
    return this.value.totalTokens;
  }

  equals(other: ValueObject<TokenUsageValue>): boolean {
    return (
      this.value.inputTokens === other.value.inputTokens &&
      this.value.outputTokens === other.value.outputTokens &&
      this.value.totalTokens === other.value.totalTokens
    );
  }
}
