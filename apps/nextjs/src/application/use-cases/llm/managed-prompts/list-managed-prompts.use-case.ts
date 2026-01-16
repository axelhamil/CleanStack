import type { UseCase } from "@packages/ddd-kit";
import {
  DEFAULT_PAGINATION,
  type PaginatedResult,
  Result,
} from "@packages/ddd-kit";
import type {
  IListManagedPromptsInputDto,
  IListManagedPromptsOutputDto,
} from "@/application/dto/llm/list-managed-prompts.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { mapToBaseDto } from "./_shared/managed-prompt-dto.helper";

export class ListManagedPromptsUseCase
  implements UseCase<IListManagedPromptsInputDto, IListManagedPromptsOutputDto>
{
  constructor(private readonly promptRepository: IManagedPromptRepository) {}

  async execute(
    input: IListManagedPromptsInputDto,
  ): Promise<Result<IListManagedPromptsOutputDto>> {
    const pagination = {
      page: input.pagination?.page ?? DEFAULT_PAGINATION.page,
      limit: input.pagination?.limit ?? DEFAULT_PAGINATION.limit,
    };

    const hasFilters =
      input.environment !== undefined || input.search !== undefined;

    let result: Result<PaginatedResult<ManagedPrompt>>;

    if (hasFilters) {
      const criteria: Record<string, unknown> = {};
      if (input.environment) {
        criteria.environment = input.environment;
      }
      if (input.search) {
        criteria.search = input.search;
      }
      result = await this.promptRepository.findMany(criteria, pagination);
    } else {
      result = await this.promptRepository.findAll(pagination);
    }

    if (result.isFailure) {
      return result as unknown as Result<IListManagedPromptsOutputDto>;
    }

    const paginatedData = result.getValue();
    return Result.ok({
      prompts: paginatedData.data.map((prompt) => mapToBaseDto(prompt)),
      pagination: paginatedData.pagination,
    });
  }
}
