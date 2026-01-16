import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  ICreateManagedPromptInputDto,
  ICreateManagedPromptOutputDto,
} from "@/application/dto/llm/create-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import { PromptEnvironment } from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptKey } from "@/domain/llm/prompt/value-objects/prompt-key.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import type { PromptVariable } from "@/domain/llm/prompt/value-objects/prompt-variable.vo";
import { createVariablesFromInput } from "./_shared/managed-prompt-dto.helper";

export class CreateManagedPromptUseCase
  implements
    UseCase<ICreateManagedPromptInputDto, ICreateManagedPromptOutputDto>
{
  constructor(
    private readonly promptRepository: IManagedPromptRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ICreateManagedPromptInputDto,
  ): Promise<Result<ICreateManagedPromptOutputDto>> {
    const validationResult = this.validateAndCreateValueObjects(input);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }

    const { key, name, description, template, variables, environment } =
      validationResult.getValue();

    const existsResult = await this.checkDuplicateKey(key, environment);
    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    const prompt = ManagedPrompt.create({
      key,
      name,
      description,
      template,
      variables,
      environment,
      isActive: true,
    });

    const saveResult = await this.promptRepository.create(prompt);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    const dispatchResult = await this.eventDispatcher.dispatchAll(
      prompt.domainEvents,
    );
    if (dispatchResult.isFailure) {
      return Result.fail(dispatchResult.getError());
    }
    prompt.clearEvents();

    return Result.ok(this.toDto(prompt));
  }

  private validateAndCreateValueObjects(
    input: ICreateManagedPromptInputDto,
  ): Result<{
    key: PromptKey;
    name: PromptName;
    description: Option<PromptDescription>;
    template: PromptTemplate;
    variables: PromptVariable[];
    environment: PromptEnvironment;
  }> {
    const keyResult = PromptKey.create(input.key as string);
    if (keyResult.isFailure) {
      return Result.fail(keyResult.getError());
    }

    const nameResult = PromptName.create(input.name as string);
    if (nameResult.isFailure) {
      return Result.fail(nameResult.getError());
    }

    const templateResult = PromptTemplate.create(input.template as string);
    if (templateResult.isFailure) {
      return Result.fail(templateResult.getError());
    }

    const environmentResult = PromptEnvironment.create(
      input.environment as "development" | "staging" | "production",
    );
    if (environmentResult.isFailure) {
      return Result.fail(environmentResult.getError());
    }

    let description: Option<PromptDescription> = Option.none();
    if (input.description) {
      const descResult = PromptDescription.create(input.description as string);
      if (descResult.isFailure) {
        return Result.fail(descResult.getError());
      }
      description = Option.some(descResult.getValue());
    }

    const template = templateResult.getValue();
    const variables = createVariablesFromInput(input.variables, template);

    return Result.ok({
      key: keyResult.getValue(),
      name: nameResult.getValue(),
      description,
      template,
      variables,
      environment: environmentResult.getValue(),
    });
  }

  private async checkDuplicateKey(
    key: PromptKey,
    environment: PromptEnvironment,
  ): Promise<Result<void>> {
    const existsResult = await this.promptRepository.findByKey(
      key.value,
      environment.value,
    );

    if (existsResult.isFailure) {
      return Result.fail(existsResult.getError());
    }

    return match<ManagedPrompt, Result<void>>(existsResult.getValue(), {
      Some: () =>
        Result.fail(
          `Prompt with key '${key.value}' already exists in ${environment.value} environment`,
        ),
      None: () => Result.ok(),
    });
  }

  private toDto(prompt: ManagedPrompt): ICreateManagedPromptOutputDto {
    return {
      id: prompt.id.value.toString(),
      key: prompt.get("key").value,
      name: prompt.get("name").value,
      version: prompt.get("version"),
      createdAt: prompt.get("createdAt").toISOString(),
    };
  }
}
