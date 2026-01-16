import type { Option, PaginatedResult, Result } from "@packages/ddd-kit";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import type { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";

/**
 * Drizzle implementation of IManagedPromptRepository
 * TDD: Stub for RED phase - implement in GREEN phase
 */
export class DrizzleManagedPromptRepository
  implements IManagedPromptRepository
{
  create(_prompt: ManagedPrompt): Promise<Result<ManagedPrompt>> {
    throw new Error("Not implemented");
  }

  update(_prompt: ManagedPrompt): Promise<Result<ManagedPrompt>> {
    throw new Error("Not implemented");
  }

  delete(_id: ManagedPromptId): Promise<Result<ManagedPromptId>> {
    throw new Error("Not implemented");
  }

  findById(_id: ManagedPromptId): Promise<Result<Option<ManagedPrompt>>> {
    throw new Error("Not implemented");
  }

  findByKey(
    _key: string,
    _environment: string,
  ): Promise<Result<Option<ManagedPrompt>>> {
    throw new Error("Not implemented");
  }

  findActiveByKey(
    _key: string,
    _environment: string,
  ): Promise<Result<Option<ManagedPrompt>>> {
    throw new Error("Not implemented");
  }

  getVersionHistory(
    _promptId: ManagedPromptId,
  ): Promise<Result<ManagedPrompt[]>> {
    throw new Error("Not implemented");
  }

  activateVersion(
    _promptId: ManagedPromptId,
    _version: number,
  ): Promise<Result<void>> {
    throw new Error("Not implemented");
  }

  findAll(_pagination?: {
    page: number;
    limit: number;
  }): Promise<Result<PaginatedResult<ManagedPrompt>>> {
    throw new Error("Not implemented");
  }

  exists(_id: ManagedPromptId): Promise<Result<boolean>> {
    throw new Error("Not implemented");
  }

  count(): Promise<Result<number>> {
    throw new Error("Not implemented");
  }

  findMany(
    _props: Partial<ManagedPrompt["_props"]>,
    _pagination?: { page: number; limit: number },
  ): Promise<Result<PaginatedResult<ManagedPrompt>>> {
    throw new Error("Not implemented");
  }

  findBy(
    _props: Partial<ManagedPrompt["_props"]>,
  ): Promise<Result<Option<ManagedPrompt>>> {
    throw new Error("Not implemented");
  }
}
