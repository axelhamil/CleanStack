import type { UseCase } from "@packages/ddd-kit";
import { match, Result, UUID } from "@packages/ddd-kit";
import type {
  IRollbackManagedPromptInputDto,
  IRollbackManagedPromptOutputDto,
} from "@/application/dto/llm/rollback-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";

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
    if (!input.promptId || input.promptId.trim() === "") {
      return Result.fail("Prompt ID is required");
    }

    if (input.targetVersion <= 0) {
      return Result.fail("Target version must be a positive number");
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(input.promptId)) {
      return Result.fail("Invalid prompt ID format");
    }

    const promptId = ManagedPromptId.create(new UUID<string>(input.promptId));

    const findResult = await this.promptRepository.findById(promptId);
    if (findResult.isFailure) {
      return findResult as unknown as Result<IRollbackManagedPromptOutputDto>;
    }

    const promptOption = findResult.getValue();
    const prompt = match(promptOption, {
      Some: (p) => p,
      None: () => null,
    });

    if (!prompt) {
      return Result.fail(`Prompt with ID '${input.promptId}' not found`);
    }

    const currentVersion = prompt.getProps().version;

    if (input.targetVersion === currentVersion) {
      return Result.fail(`Prompt is already at version ${input.targetVersion}`);
    }

    const activateResult = await this.promptRepository.activateVersion(
      promptId,
      input.targetVersion,
    );

    if (activateResult.isFailure) {
      return activateResult as unknown as Result<IRollbackManagedPromptOutputDto>;
    }

    await this.eventDispatcher.dispatchAll(prompt.domainEvents);
    prompt.clearEvents();

    const props = prompt.getProps();
    return Result.ok({
      id: prompt.id.value.toString(),
      key: props.key.value,
      name: props.name.value,
      currentVersion: input.targetVersion,
      rolledBackFrom: currentVersion,
      updatedAt: new Date().toISOString(),
    });
  }
}
