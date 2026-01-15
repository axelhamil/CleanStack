import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const costSchema = z.object({
  amount: z.number().nonnegative("Cost amount must be non-negative"),
  currency: z.string().min(1).max(3).default("USD"),
});

export interface CostValue {
  amount: number;
  currency: string;
}

export class Cost extends ValueObject<CostValue> {
  protected validate(value: CostValue): Result<CostValue> {
    const result = costSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid cost");
    }

    return Result.ok(result.data);
  }

  get amount(): number {
    return this.value.amount;
  }

  get currency(): string {
    return this.value.currency;
  }

  static zero(currency = "USD"): Result<Cost> {
    return Cost.create({ amount: 0, currency });
  }
}
