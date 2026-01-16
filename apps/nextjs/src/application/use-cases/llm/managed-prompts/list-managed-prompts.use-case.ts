import type { UseCase } from "@packages/ddd-kit";
import {
  DEFAULT_PAGINATION,
  match,
  type PaginatedResult,
  Result,
} from "@packages/ddd-kit";
import type {
  IListManagedPromptsInputDto,
  IListManagedPromptsOutputDto,
  IManagedPromptSummaryDto,
} from "@/application/dto/llm/list-managed-prompts.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";

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
      prompts: paginatedData.data.map((prompt) => this.toSummaryDto(prompt)),
      pagination: paginatedData.pagination,
    });
  }

  private toSummaryDto(prompt: ManagedPrompt): IManagedPromptSummaryDto {
    const props = prompt.getProps();
    return {
      id: prompt.id.value.toString(),
      key: props.key.value,
      name: props.name.value,
      description: match<string, string | null>(
        props.description.map((d) => d.value),
        {
          Some: (d) => d,
          None: () => null,
        },
      ),
      version: props.version,
      isActive: props.isActive,
      environment: props.environment.value,
      createdAt: props.createdAt.toISOString(),
      updatedAt: match<Date, string | null>(props.updatedAt, {
        Some: (d) => d.toISOString(),
        None: () => null,
      }),
    };
  }
}
