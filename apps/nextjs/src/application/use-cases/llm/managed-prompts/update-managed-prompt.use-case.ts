import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IUpdateManagedPromptInputDto,
  IUpdateManagedPromptOutputDto,
} from "@/application/dto/llm/update-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";

export class UpdateManagedPromptUseCase
  implements
    UseCase<IUpdateManagedPromptInputDto, IUpdateManagedPromptOutputDto>
{
  constructor(
    private readonly promptRepository: IManagedPromptRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    _input: IUpdateManagedPromptInputDto,
  ): Promise<Result<IUpdateManagedPromptOutputDto>> {
    throw new Error("Not implemented");
  }
}
