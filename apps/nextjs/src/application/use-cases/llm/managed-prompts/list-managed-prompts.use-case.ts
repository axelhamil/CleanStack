import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IListManagedPromptsInputDto,
  IListManagedPromptsOutputDto,
} from "@/application/dto/llm/list-managed-prompts.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";

export class ListManagedPromptsUseCase
  implements UseCase<IListManagedPromptsInputDto, IListManagedPromptsOutputDto>
{
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
  constructor(private readonly promptRepository: IManagedPromptRepository) {}

  async execute(
    _input: IListManagedPromptsInputDto,
  ): Promise<Result<IListManagedPromptsOutputDto>> {
    throw new Error("Not implemented");
  }
}
