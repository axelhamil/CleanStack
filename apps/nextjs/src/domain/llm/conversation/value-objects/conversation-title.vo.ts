import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const conversationTitleSchema = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => v.length >= 1, { message: "Title is required" })
  .refine((v) => v.length <= 200, {
    message: "Title must be less than 200 characters",
  });

export class ConversationTitle extends ValueObject<string> {
  constructor(value: string) {
    super(value.trim());
  }

  protected validate(value: string): Result<string> {
    const result = conversationTitleSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid conversation title");
    }

    return Result.ok(result.data);
  }
}
