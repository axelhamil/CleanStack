import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const conversationTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(200, "Title must be less than 200 characters")
  .transform((v) => v.trim());

export class ConversationTitle extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = conversationTitleSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid conversation title");
    }

    return Result.ok(result.data);
  }
}
