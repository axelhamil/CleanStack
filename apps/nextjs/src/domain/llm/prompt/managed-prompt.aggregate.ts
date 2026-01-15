import { Aggregate, Option, Result, UUID } from "@packages/ddd-kit";
import { ManagedPromptActivatedEvent } from "./events/managed-prompt-activated.event";
import { ManagedPromptCreatedEvent } from "./events/managed-prompt-created.event";
import { ManagedPromptDeactivatedEvent } from "./events/managed-prompt-deactivated.event";
import { ManagedPromptUpdatedEvent } from "./events/managed-prompt-updated.event";
import { ManagedPromptId } from "./managed-prompt-id";
import type { PromptDescription } from "./value-objects/prompt-description.vo";
import type { PromptEnvironment } from "./value-objects/prompt-environment.vo";
import type { PromptKey } from "./value-objects/prompt-key.vo";
import type { PromptName } from "./value-objects/prompt-name.vo";
import type { PromptTemplate } from "./value-objects/prompt-template.vo";
import type { PromptVariable } from "./value-objects/prompt-variable.vo";

interface IManagedPromptProps {
  key: PromptKey;
  name: PromptName;
  description: Option<PromptDescription>;
  template: PromptTemplate;
  variables: PromptVariable[];
  version: number;
  environment: PromptEnvironment;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Option<Date>;
}

export class ManagedPrompt extends Aggregate<IManagedPromptProps> {
  private constructor(props: IManagedPromptProps, id?: UUID<string | number>) {
    super(props, id);
  }

  get id(): ManagedPromptId {
    return ManagedPromptId.create(this._id);
  }

  static create(
    props: Omit<IManagedPromptProps, "version" | "createdAt" | "updatedAt">,
    id?: UUID<string | number>,
  ): ManagedPrompt {
    const prompt = new ManagedPrompt(
      {
        ...props,
        version: 1,
        createdAt: new Date(),
        updatedAt: Option.none(),
      },
      id ?? new UUID<string>(),
    );
    prompt.addEvent(new ManagedPromptCreatedEvent(prompt));
    return prompt;
  }

  static reconstitute(
    props: IManagedPromptProps,
    id: UUID<string | number>,
  ): ManagedPrompt {
    return new ManagedPrompt(props, id);
  }

  updateContent(
    template: PromptTemplate,
    variables: PromptVariable[],
    name?: PromptName,
    description?: Option<PromptDescription>,
  ): void {
    const previousVersion = this._props.version;
    this._props.template = template;
    this._props.variables = variables;
    if (name) {
      this._props.name = name;
    }
    if (description !== undefined) {
      this._props.description = description;
    }
    this._props.version = previousVersion + 1;
    this._props.updatedAt = Option.some(new Date());
    this.addEvent(new ManagedPromptUpdatedEvent(this, previousVersion));
  }

  activate(): void {
    if (this._props.isActive) return;
    this._props.isActive = true;
    this._props.updatedAt = Option.some(new Date());
    this.addEvent(new ManagedPromptActivatedEvent(this));
  }

  deactivate(): void {
    if (!this._props.isActive) return;
    this._props.isActive = false;
    this._props.updatedAt = Option.some(new Date());
    this.addEvent(new ManagedPromptDeactivatedEvent(this));
  }

  render(variables: Record<string, string>): Result<string> {
    const requiredVariables = this._props.variables
      .filter((v) => v.required)
      .map((v) => v.name);

    for (const varName of requiredVariables) {
      if (!(varName in variables)) {
        return Result.fail(`Missing required variable: ${varName}`);
      }
    }

    const allVariables: Record<string, string> = {};
    for (const v of this._props.variables) {
      const providedValue = variables[v.name];
      if (providedValue !== undefined) {
        allVariables[v.name] = providedValue;
      } else if (v.defaultValue !== undefined) {
        allVariables[v.name] = v.defaultValue;
      }
    }

    return Result.ok(this._props.template.render(allVariables));
  }

  changeEnvironment(environment: PromptEnvironment): void {
    this._props.environment = environment;
    this._props.updatedAt = Option.some(new Date());
  }
}
