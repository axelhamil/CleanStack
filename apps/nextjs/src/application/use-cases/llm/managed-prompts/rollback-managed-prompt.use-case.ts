import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IRollbackManagedPromptInputDto,
  IRollbackManagedPromptOutputDto,
} from "@/application/dto/llm/rollback-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";

export class RollbackManagedPromptUseCase
  implements
    UseCase<IRollbackManagedPromptInputDto, IRollbackManagedPromptOutputDto>
{
  constructor(
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
    private readonly promptRepository: IManagedPromptRepository,
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    _input: IRollbackManagedPromptInputDto,
  ): Promise<Result<IRollbackManagedPromptOutputDto>> {
    throw new Error("Not implemented");
  }
}
