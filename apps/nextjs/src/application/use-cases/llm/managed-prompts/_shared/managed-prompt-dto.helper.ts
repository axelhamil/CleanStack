import { match, type Option, Result, UUID } from "@packages/ddd-kit";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";
import type { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import {
  PromptVariable,
  type PromptVariableType,
  type PromptVariableValue,
} from "@/domain/llm/prompt/value-objects/prompt-variable.vo";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parsePromptId(promptId: string): Result<ManagedPromptId> {
  if (!promptId || promptId.trim() === "")
    return Result.fail("Prompt ID is required");

  if (!UUID_PATTERN.test(promptId))
    return Result.fail("Invalid prompt ID format");

  return Result.ok(ManagedPromptId.create(new UUID<string>(promptId)));
}

export interface IVariableInput {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface IManagedPromptBaseDto {
  id: string;
  key: string;
  name: string;
  description: string | null;
  version: number;
  isActive: boolean;
  environment: "development" | "staging" | "production";
  createdAt: string;
  updatedAt: string | null;
}

export interface IManagedPromptFullDto extends IManagedPromptBaseDto {
  template: string;
  variables: Array<{
    name: string;
    type: "string" | "number" | "boolean";
    required: boolean;
    defaultValue?: string;
  }>;
}

export function mapToBaseDto(prompt: ManagedPrompt): IManagedPromptBaseDto {
  const props = prompt.getProps();
  return {
    id: prompt.id.value.toString(),
    key: props.key.value,
    name: props.name.value,
    description: match<string, string | null>(
      props.description.map((d) => d.value),
      {
        Some: (d) => d,
        None: () => null,
      },
    ),
    version: props.version,
    isActive: props.isActive,
    environment: props.environment.value as
      | "development"
      | "staging"
      | "production",
    createdAt: props.createdAt.toISOString(),
    updatedAt: match<Date, string | null>(props.updatedAt, {
      Some: (d) => d.toISOString(),
      None: () => null,
    }),
  };
}

export function mapToFullDto(prompt: ManagedPrompt): IManagedPromptFullDto {
  const props = prompt.getProps();
  return {
    ...mapToBaseDto(prompt),
    template: props.template.value,
    variables: props.variables.map((v) => ({
      name: v.name,
      type: v.type as "string" | "number" | "boolean",
      required: v.required,
      defaultValue: v.defaultValue,
    })),
  };
}

export function unwrapPromptOption(
  promptOption: Option<ManagedPrompt>,
  promptId: string,
): Result<ManagedPrompt> {
  const prompt = match(promptOption, {
    Some: (p: ManagedPrompt) => p,
    None: () => null,
  });

  if (!prompt) return Result.fail(`Prompt with ID '${promptId}' not found`);

  return Result.ok(prompt);
}

export function createVariablesFromInput(
  inputVariables: IVariableInput[] | undefined,
  template: PromptTemplate,
): PromptVariable[] {
  if (inputVariables && inputVariables.length > 0) {
    return inputVariables.map((v) => {
      const result = PromptVariable.create({
        name: v.name,
        type: v.type as PromptVariableType,
        required: v.required,
        defaultValue: v.defaultValue,
      } as PromptVariableValue);
      return result.getValue();
    });
  }

  const extractedVars = template.extractVariables();
  return extractedVars.map((name) => {
    const result = PromptVariable.create({
      name,
      type: "string",
      required: true,
    } as PromptVariableValue);
    return result.getValue();
  });
}

export async function findPromptById(
  promptIdStr: string,
  promptRepository: IManagedPromptRepository,
): Promise<Result<ManagedPrompt>> {
  const promptIdResult = parsePromptId(promptIdStr);
  if (promptIdResult.isFailure) {
    return Result.fail(promptIdResult.getError());
  }

  const findResult = await promptRepository.findById(promptIdResult.getValue());
  if (findResult.isFailure) {
    return Result.fail(findResult.getError());
  }

  return unwrapPromptOption(findResult.getValue(), promptIdStr);
}
