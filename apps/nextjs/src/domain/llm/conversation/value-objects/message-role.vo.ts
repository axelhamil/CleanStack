import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export const MESSAGE_ROLES = ["user", "assistant", "system"] as const;
export type MessageRoleType = (typeof MESSAGE_ROLES)[number];

const messageRoleSchema = z.enum(MESSAGE_ROLES);

export class MessageRole extends ValueObject<MessageRoleType> {
  protected validate(value: MessageRoleType): Result<MessageRoleType> {
    const result = messageRoleSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid message role");
    }

    return Result.ok(result.data);
  }

  get isUser(): boolean {
    return this.value === "user";
  }

  get isAssistant(): boolean {
    return this.value === "assistant";
  }

  get isSystem(): boolean {
    return this.value === "system";
  }
}
