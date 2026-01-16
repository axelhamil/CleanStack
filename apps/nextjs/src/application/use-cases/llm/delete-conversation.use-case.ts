import type { UseCase } from "@packages/ddd-kit";
import { Result as R, type Result } from "@packages/ddd-kit";
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
  ): Promise<Result<IDeleteConversationOutputDto>> {
    const conversationResult = await findConversationWithOwnershipCheck(
      input.conversationId,
      input.userId,
      this.conversationRepository,
    );
    if (conversationResult.isFailure) {
      return R.fail(conversationResult.getError());
    }

    return this.deleteConversation(conversationResult.getValue());
  }

  private async deleteConversation(
    conversation: Conversation,
  ): Promise<Result<IDeleteConversationOutputDto>> {
    const deleteResult = await this.conversationRepository.delete(
      conversation.id,
    );
    if (deleteResult.isFailure) {
      return R.fail(deleteResult.getError());
    }

    await this.eventDispatcher.dispatch(
      new ConversationDeletedEvent(conversation),
    );

    return R.ok({
      success: true,
      deletedAt: new Date().toISOString(),
    });
  }
}
