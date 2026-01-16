import type { UseCase } from "@packages/ddd-kit";
import { Result } from "@packages/ddd-kit";
import type {
  IRollbackManagedPromptInputDto,
  IRollbackManagedPromptOutputDto,
} from "@/application/dto/llm/rollback-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { findPromptById } from "./_shared/managed-prompt-dto.helper";

export class RollbackManagedPromptUseCase
  implements
    UseCase<IRollbackManagedPromptInputDto, IRollbackManagedPromptOutputDto>
{
  constructor(
    private readonly promptRepository: IManagedPromptRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IRollbackManagedPromptInputDto,
  ): Promise<Result<IRollbackManagedPromptOutputDto>> {
    if (input.targetVersion <= 0)
      return Result.fail("Target version must be a positive number");

    const promptResult = await findPromptById(
      input.promptId,
      this.promptRepository,
    );
    if (promptResult.isFailure) return Result.fail(promptResult.getError());

    const prompt = promptResult.getValue();
    const currentVersion = prompt.get("version");

    if (input.targetVersion === currentVersion)
      return Result.fail(`Prompt is already at version ${input.targetVersion}`);

    const activateResult = await this.promptRepository.activateVersion(
      prompt.id,
      input.targetVersion,
    );

    if (activateResult.isFailure) return Result.fail(activateResult.getError());

    await this.eventDispatcher.dispatchAll(prompt.domainEvents);
    prompt.clearEvents();

    return Result.ok({
      id: prompt.id.value.toString(),
      key: prompt.get("key").value,
      name: prompt.get("name").value,
      currentVersion: input.targetVersion,
      rolledBackFrom: currentVersion,
      updatedAt: new Date().toISOString(),
    });
  }
}
