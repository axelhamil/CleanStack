import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const conversationMetadataSchema = z
  .record(z.string(), z.unknown())
  .nullable()
  .default({});

export type ConversationMetadataValue = Record<string, unknown> | null;

export class ConversationMetadata extends ValueObject<ConversationMetadataValue> {
  protected validate(
    value: ConversationMetadataValue,
  ): Result<ConversationMetadataValue> {
    const result = conversationMetadataSchema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(
        firstIssue?.message ?? "Invalid conversation metadata",
      );
    }

    return Result.ok(result.data);
  }

  equals(other: ValueObject<ConversationMetadataValue>): boolean {
    if (this.value === null && other.value === null) {
      return true;
    }
    if (this.value === null || other.value === null) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }
}
