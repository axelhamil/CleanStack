import type { UseCase } from "@packages/ddd-kit";
import { match, Result } from "@packages/ddd-kit";
import type {
  IGetManagedPromptInputDto,
  IGetManagedPromptOutputDto,
} from "@/application/dto/llm/get-managed-prompt.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";

export class GetManagedPromptUseCase
  implements UseCase<IGetManagedPromptInputDto, IGetManagedPromptOutputDto>
{
  constructor(private readonly promptRepository: IManagedPromptRepository) {}

  async execute(
    input: IGetManagedPromptInputDto,
  ): Promise<Result<IGetManagedPromptOutputDto>> {
    const result = await this.promptRepository.findByKey(
      input.key,
      input.environment,
    );

    if (result.isFailure) {
      return result as unknown as Result<IGetManagedPromptOutputDto>;
    }

    return match<ManagedPrompt, Result<IGetManagedPromptOutputDto>>(
      result.getValue(),
      {
        Some: (prompt) => this.toDto(prompt),
        None: () =>
          Result.fail(
            `Prompt with key '${input.key}' not found in environment '${input.environment}'`,
          ),
      },
    );
  }

  private toDto(prompt: ManagedPrompt): Result<IGetManagedPromptOutputDto> {
    const props = prompt.getProps();
    return Result.ok({
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
      template: props.template.value,
      variables: props.variables.map((v) => ({
        name: v.name,
        type: v.type,
        required: v.required,
        defaultValue: v.defaultValue,
      })),
      version: props.version,
      isActive: props.isActive,
      environment: props.environment.value,
      createdAt: props.createdAt.toISOString(),
      updatedAt: match<Date, string | null>(props.updatedAt, {
        Some: (d) => d.toISOString(),
        None: () => null,
      }),
    });
  }
}
