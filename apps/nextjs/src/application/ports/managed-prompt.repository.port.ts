import type { BaseRepository, Option, Result } from "@packages/ddd-kit";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import type { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";

export interface IManagedPromptRepository
  extends BaseRepository<ManagedPrompt> {
  findById(id: ManagedPromptId): Promise<Result<Option<ManagedPrompt>>>;
  findByKey(
    key: string,
    environment: string,
  ): Promise<Result<Option<ManagedPrompt>>>;
  findActiveByKey(
    key: string,
    environment: string,
  ): Promise<Result<Option<ManagedPrompt>>>;
  getVersionHistory(
    promptId: ManagedPromptId,
  ): Promise<Result<ManagedPrompt[]>>;
  activateVersion(
    promptId: ManagedPromptId,
    version: number,
  ): Promise<Result<void>>;
}
