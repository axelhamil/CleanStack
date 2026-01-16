import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  ITestManagedPromptInputDto,
  ITestManagedPromptOutputDto,
} from "@/application/dto/llm/test-managed-prompt.dto";
import type { ILLMProvider } from "@/application/ports/llm.provider.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";

export class TestManagedPromptUseCase
  implements UseCase<ITestManagedPromptInputDto, ITestManagedPromptOutputDto>
{
  constructor(
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
    private readonly promptRepository: IManagedPromptRepository,
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Will be used in GREEN phase
    private readonly llmProvider: ILLMProvider,
  ) {}

  async execute(
    _input: ITestManagedPromptInputDto,
  ): Promise<Result<ITestManagedPromptOutputDto>> {
    throw new Error("Not implemented");
  }
}
