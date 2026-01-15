import { Result, ValueObject } from "@packages/ddd-kit";
import { z } from "zod";

const schema = z.string().min(1, "Prompt template must not be empty");

export class PromptTemplate extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    const result = schema.safeParse(value);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return Result.fail(firstIssue?.message ?? "Invalid prompt template");
    }
    return Result.ok(result.data);
  }

  extractVariables(): string[] {
    const matches = this.value.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim()))];
  }

  render(variables: Record<string, string>): string {
    return this.value.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim();
      return variables[trimmedKey] ?? `{{${trimmedKey}}}`;
    });
  }
}
