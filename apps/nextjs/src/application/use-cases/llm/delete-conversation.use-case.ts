import type { UseCase } from "@packages/ddd-kit";
import { Result } from "@packages/ddd-kit";
import type { Transaction } from "@packages/drizzle";
import type {
  IDeleteConversationInputDto,
  IDeleteConversationOutputDto,
} from "@/application/dto/llm/delete-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationDeletedEvent } from "@/domain/llm/conversation/events/conversation-deleted.event";
import { findConversationWithOwnershipCheck } from "./_shared/conversation.helper";

export class DeleteConversationUseCase
  implements UseCase<IDeleteConversationInputDto, IDeleteConversationOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: IDeleteConversationInputDto,
    trx?: Transaction,
  ): Promise<Result<IDeleteConversationOutputDto>> {
    const conversationResult = await findConversationWithOwnershipCheck(
      input.conversationId,
      input.userId,
      this.conversationRepository,
    );
    if (conversationResult.isFailure)
      return Result.fail(conversationResult.getError());

    return this.deleteConversation(conversationResult.getValue(), trx);
  }

  private async deleteConversation(
    conversation: Conversation,
    trx?: Transaction,
  ): Promise<Result<IDeleteConversationOutputDto>> {
    const deleteResult = await this.conversationRepository.delete(
      conversation.id,
      trx,
    );
    if (deleteResult.isFailure) return Result.fail(deleteResult.getError());

    await this.eventDispatcher.dispatch(
      new ConversationDeletedEvent(conversation),
    );

    return Result.ok({
      success: true,
      deletedAt: new Date().toISOString(),
    });
  }
}
