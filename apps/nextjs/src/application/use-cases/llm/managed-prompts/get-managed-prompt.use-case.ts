import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IGetManagedPromptInputDto,
  IGetManagedPromptOutputDto,
} from "@/application/dto/llm/get-managed-prompt.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";

export class GetManagedPromptUseCase
  implements UseCase<IGetManagedPromptInputDto, IGetManagedPromptOutputDto>
{
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
  constructor(private readonly promptRepository: IManagedPromptRepository) {}

  async execute(
    _input: IGetManagedPromptInputDto,
  ): Promise<Result<IGetManagedPromptOutputDto>> {
    throw new Error("Not implemented");
  }
}
