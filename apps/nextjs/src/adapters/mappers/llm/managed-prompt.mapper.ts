import { Option, Result, UUID } from "@packages/ddd-kit";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import {
  PromptEnvironment,
  type PromptEnvironmentType,
} from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptKey } from "@/domain/llm/prompt/value-objects/prompt-key.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import {
  PromptVariable,
  type PromptVariableValue,
} from "@/domain/llm/prompt/value-objects/prompt-variable.vo";

export interface PromptVariablePersistence {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  defaultValue?: string;
}

export interface ManagedPromptPersistence {
  id: string;
  key: string;
  name: string;
  description: string | null;
  template: string;
  variables: PromptVariablePersistence[];
  version: number;
  environment: "development" | "staging" | "production";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export function managedPromptToDomain(
  record: ManagedPromptPersistence,
): Result<ManagedPrompt> {
  const keyResult = PromptKey.create(record.key);
  if (keyResult.isFailure) {
    return Result.fail(`Invalid key: ${keyResult.getError()}`);
  }

  const nameResult = PromptName.create(record.name);
  if (nameResult.isFailure) {
    return Result.fail(`Invalid name: ${nameResult.getError()}`);
  }

  let descriptionOption: Option<PromptDescription> = Option.none();
  if (record.description !== null) {
    const descriptionResult = PromptDescription.create(record.description);
    if (descriptionResult.isFailure) {
      return Result.fail(
        `Invalid description: ${descriptionResult.getError()}`,
      );
    }
    descriptionOption = Option.some(descriptionResult.getValue());
  }

  const templateResult = PromptTemplate.create(record.template);
  if (templateResult.isFailure) {
    return Result.fail(`Invalid template: ${templateResult.getError()}`);
  }

  const variables: PromptVariable[] = [];
  for (const varRecord of record.variables) {
    const variableResult = PromptVariable.create(
      varRecord as PromptVariableValue,
    );
    if (variableResult.isFailure) {
      return Result.fail(`Invalid variable: ${variableResult.getError()}`);
    }
    variables.push(variableResult.getValue());
  }

  const environmentResult = PromptEnvironment.create(
    record.environment as PromptEnvironmentType,
  );
  if (environmentResult.isFailure) {
    return Result.fail(`Invalid environment: ${environmentResult.getError()}`);
  }

  const updatedAtOption: Option<Date> =
    record.updatedAt !== null ? Option.some(record.updatedAt) : Option.none();

  const prompt = ManagedPrompt.reconstitute(
    {
      key: keyResult.getValue(),
      name: nameResult.getValue(),
      description: descriptionOption,
      template: templateResult.getValue(),
      variables,
      version: record.version,
      environment: environmentResult.getValue(),
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: updatedAtOption,
    },
    new UUID(record.id),
  );

  return Result.ok(prompt);
}

export function managedPromptToPersistence(
  prompt: ManagedPrompt,
): ManagedPromptPersistence {
  const description = prompt.get("description");
  const updatedAt = prompt.get("updatedAt");

  const variables: PromptVariablePersistence[] = prompt
    .get("variables")
    .map((v) => ({
      name: v.name,
      type: v.type,
      required: v.required,
      defaultValue: v.defaultValue,
    }));

  return {
    id: String(prompt.id.value),
    key: prompt.get("key").value,
    name: prompt.get("name").value,
    description: description.isSome() ? description.unwrap().value : null,
    template: prompt.get("template").value,
    variables,
    version: prompt.get("version"),
    environment: prompt.get("environment").value,
    isActive: prompt.get("isActive"),
    createdAt: prompt.get("createdAt"),
    updatedAt: updatedAt.isSome() ? updatedAt.unwrap() : null,
  };
}
