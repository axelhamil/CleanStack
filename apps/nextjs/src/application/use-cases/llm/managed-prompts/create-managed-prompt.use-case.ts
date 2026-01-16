import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  ICreateManagedPromptInputDto,
  ICreateManagedPromptOutputDto,
} from "@/application/dto/llm/create-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";

export class CreateManagedPromptUseCase
  implements
    UseCase<ICreateManagedPromptInputDto, ICreateManagedPromptOutputDto>
{
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
  constructor(
    private readonly promptRepository: IManagedPromptRepository,
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    _input: ICreateManagedPromptInputDto,
  ): Promise<Result<ICreateManagedPromptOutputDto>> {
    throw new Error("Not implemented");
  }
}
