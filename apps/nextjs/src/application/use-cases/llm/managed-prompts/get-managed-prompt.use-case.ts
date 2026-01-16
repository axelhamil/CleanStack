import type { UseCase } from "@packages/ddd-kit";
import { match, Result } from "@packages/ddd-kit";
import type {
  IGetManagedPromptInputDto,
  IGetManagedPromptOutputDto,
} from "@/application/dto/llm/get-managed-prompt.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { mapToFullDto } from "./_shared/managed-prompt-dto.helper";

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
        Some: (prompt) => Result.ok(mapToFullDto(prompt)),
        None: () =>
          Result.fail(
            `Prompt with key '${input.key}' not found in environment '${input.environment}'`,
          ),
      },
    );
  }
}
