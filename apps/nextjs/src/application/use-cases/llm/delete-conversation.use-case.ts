import type { UseCase } from "@packages/ddd-kit";
import { match, Result as R, type Result, UUID } from "@packages/ddd-kit";
import type {
  IDeleteConversationInputDto,
  IDeleteConversationOutputDto,
} from "@/application/dto/llm/delete-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { ConversationDeletedEvent } from "@/domain/llm/conversation/events/conversation-deleted.event";

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
    const conversationIdResult = this.parseConversationId(input.conversationId);
    if (conversationIdResult.isFailure) {
      return R.fail(conversationIdResult.getError());
    }

    const conversationId = conversationIdResult.getValue();

    const conversationResult =
      await this.conversationRepository.findById(conversationId);
    if (conversationResult.isFailure) {
      return R.fail(conversationResult.getError());
    }

    return match<Conversation, Promise<Result<IDeleteConversationOutputDto>>>(
      conversationResult.getValue(),
      {
        Some: async (conversation) => {
          if (!this.verifyOwnership(conversation, input.userId)) {
            return R.fail("Conversation access unauthorized");
          }
          return this.deleteConversation(conversation);
        },
        None: async () => R.fail("Conversation not found"),
      },
    );
  }

  private parseConversationId(id: string): Result<ConversationId> {
    try {
      const uuid = new UUID<string>(id);
      return R.ok(ConversationId.create(uuid));
    } catch {
      return R.fail("Invalid conversation ID");
    }
  }

  private verifyOwnership(conversation: Conversation, userId: string): boolean {
    return conversation.get("userId") === userId;
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
