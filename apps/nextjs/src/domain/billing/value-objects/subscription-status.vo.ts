import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const subscriptionStatusValues = [
  "active",
  "cancelled",
  "past_due",
  "trialing",
  "incomplete",
  "paused",
] as const;

export type SubscriptionStatusValue = (typeof subscriptionStatusValues)[number];

const subscriptionStatusSchema = z.enum(
  subscriptionStatusValues,
  `Status must be one of: ${subscriptionStatusValues.join(", ")}`,
);

export class SubscriptionStatus extends ValueObject<SubscriptionStatusValue> {
  protected validate(value: string): Result<SubscriptionStatusValue> {
    const result = subscriptionStatusSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid subscription status");
    }

    return Result.ok(result.data);
  }

  get isActive(): boolean {
    return this.value === "active";
  }

  get isCancelled(): boolean {
    return this.value === "cancelled";
  }

  get isPastDue(): boolean {
    return this.value === "past_due";
  }

  get isTrialing(): boolean {
    return this.value === "trialing";
  }

  get isIncomplete(): boolean {
    return this.value === "incomplete";
  }

  get isPaused(): boolean {
    return this.value === "paused";
  }

  get canAccess(): boolean {
    return this.isActive || this.isTrialing;
  }
}
