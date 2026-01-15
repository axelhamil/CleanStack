import { Result } from "@packages/ddd-kit";

export class DomainPrompt {
  private readonly _key: string;
  private readonly _template: string;

  constructor(key: string, template: string) {
    this._key = key;
    this._template = template;
  }

  get key(): string {
    return this._key;
  }

  get template(): string {
    return this._template;
  }

  getVariables(): string[] {
    const matches = this._template.match(/\{\{(\w+)\}\}/g);
    if (!matches) return [];

    const variables = matches.map((match) => match.slice(2, -2));
    return [...new Set(variables)];
  }

  render(variables: Record<string, string>): Result<string> {
    const requiredVariables = this.getVariables();
    const missingVariables = requiredVariables.filter((v) => !(v in variables));

    if (missingVariables.length > 0) {
      return Result.fail(
        `Missing required variables: ${missingVariables.join(", ")}`,
      );
    }

    let result = this._template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }

    return Result.ok(result);
  }

  static readonly SYSTEM_DEFAULT = new DomainPrompt(
    "system-default",
    "You are a helpful assistant. Be concise and accurate in your responses.",
  );

  static readonly ERROR_GENERIC = new DomainPrompt(
    "error-generic",
    "An error occurred: {{message}}. Please try again or contact support if the issue persists.",
  );

  static readonly CONVERSATION_TITLE_GENERATOR = new DomainPrompt(
    "conversation-title-generator",
    "Based on the following conversation, generate a short, descriptive title (max 50 chars):\n\n{{conversation}}",
  );
}
