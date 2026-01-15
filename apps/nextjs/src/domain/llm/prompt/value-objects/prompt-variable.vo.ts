import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

export type PromptVariableType = "string" | "number" | "boolean";

export interface PromptVariableValue {
  name: string;
  type: PromptVariableType;
  required: boolean;
  defaultValue?: string;
}

const schema = z.object({
  name: z.string().min(1, "Variable name must not be empty"),
  type: z.enum(["string", "number", "boolean"]),
  required: z.boolean(),
  defaultValue: z.string().optional(),
});

export class PromptVariable extends ValueObject<PromptVariableValue> {
  protected validate(value: PromptVariableValue): Result<PromptVariableValue> {
    const result = schema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid prompt variable");
    }
    return Result.ok(result.data);
  }

  get name(): string {
    return this.value.name;
  }

  get type(): PromptVariableType {
    return this.value.type;
  }

  get required(): boolean {
    return this.value.required;
  }

  get defaultValue(): string | undefined {
    return this.value.defaultValue;
  }

  equals(other: ValueObject<PromptVariableValue>): boolean {
    return (
      this.value.name === other.value.name &&
      this.value.type === other.value.type &&
      this.value.required === other.value.required &&
      this.value.defaultValue === other.value.defaultValue
    );
  }
}
