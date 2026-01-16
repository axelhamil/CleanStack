import { match, Option, Result, type UseCase } from "@packages/ddd-kit";
import type {
  IUpdateManagedPromptInputDto,
  IUpdateManagedPromptOutputDto,
} from "@/application/dto/llm/update-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import type { PromptVariable } from "@/domain/llm/prompt/value-objects/prompt-variable.vo";
import {
  createVariablesFromInput,
  parsePromptId,
  unwrapPromptOption,
} from "./_shared/managed-prompt-dto.helper";

export class UpdateManagedPromptUseCase
  implements
    UseCase<IUpdateManagedPromptInputDto, IUpdateManagedPromptOutputDto>
{
  constructor(
    private readonly promptRepository: IManagedPromptRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IUpdateManagedPromptInputDto,
  ): Promise<Result<IUpdateManagedPromptOutputDto>> {
    const promptIdResult = parsePromptId(input.promptId);
    if (promptIdResult.isFailure) {
      return Result.fail(promptIdResult.getError());
    }

    const findResult = await this.promptRepository.findById(
      promptIdResult.getValue(),
    );
    if (findResult.isFailure) {
      return Result.fail(findResult.getError());
    }

    const promptResult = unwrapPromptOption(
      findResult.getValue(),
      input.promptId,
    );
    if (promptResult.isFailure) {
      return Result.fail(promptResult.getError());
    }
    const prompt = promptResult.getValue();

    const updateValuesResult = this.validateAndCreateUpdateValues(
      input,
      prompt,
    );
    if (updateValuesResult.isFailure) {
      return Result.fail(updateValuesResult.getError());
    }

    const { template, variables, name, description } =
      updateValuesResult.getValue();

    prompt.updateContent(template, variables, name, description);

    const updateResult = await this.promptRepository.update(prompt);
    if (updateResult.isFailure) {
      return Result.fail(updateResult.getError());
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

  private validateAndCreateUpdateValues(
    input: IUpdateManagedPromptInputDto,
    existingPrompt: ManagedPrompt,
  ): Result<{
    template: PromptTemplate;
    variables: PromptVariable[];
    name?: PromptName;
    description?: Option<PromptDescription>;
  }> {
    let template = existingPrompt.get("template");
    let variables = existingPrompt.get("variables");
    let name: PromptName | undefined;
    let description: Option<PromptDescription> | undefined;

    if (input.template !== undefined) {
      const templateResult = PromptTemplate.create(input.template as string);
      if (templateResult.isFailure) {
        return Result.fail(templateResult.getError());
      }
      template = templateResult.getValue();
    }

    if (input.variables !== undefined) {
      variables = createVariablesFromInput(input.variables, template);
    }

    if (input.name !== undefined) {
      const nameResult = PromptName.create(input.name as string);
      if (nameResult.isFailure) {
        return Result.fail(nameResult.getError());
      }
      name = nameResult.getValue();
    }

    if (input.description !== undefined) {
      if (input.description === "") {
        description = Option.none();
      } else {
        const descResult = PromptDescription.create(
          input.description as string,
        );
        if (descResult.isFailure) {
          return Result.fail(descResult.getError());
        }
        description = Option.some(descResult.getValue());
      }
    }

    return Result.ok({ template, variables, name, description });
  }

  private toDto(prompt: ManagedPrompt): IUpdateManagedPromptOutputDto {
    const updatedAt = prompt.get("updatedAt");
    return {
      id: prompt.id.value.toString(),
      key: prompt.get("key").value,
      name: prompt.get("name").value,
      version: prompt.get("version"),
      updatedAt: match<Date, string>(updatedAt, {
        Some: (date) => date.toISOString(),
        None: () => new Date().toISOString(),
      }),
    };
  }
}
