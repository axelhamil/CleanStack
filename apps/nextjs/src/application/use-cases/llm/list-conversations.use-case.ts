import type { UseCase } from "@packages/ddd-kit";
import { Result as R, type Result } from "@packages/ddd-kit";
import type {
  IConversationSummaryDto,
  IListConversationsInputDto,
  IListConversationsOutputDto,
} from "@/application/dto/llm/list-conversations.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";

export class ListConversationsUseCase
  implements UseCase<IListConversationsInputDto, IListConversationsOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    input: IListConversationsInputDto,
  ): Promise<Result<IListConversationsOutputDto>> {
    const result = await this.conversationRepository.findByUserId(
      input.userId,
      input.pagination,
    );
    if (result.isFailure) {
      return R.fail(result.getError());
    }

    const { data: conversations, pagination } = result.getValue();

    const conversationSummaries = await Promise.all(
      conversations.map((conv) => this.toSummaryDto(conv)),
    );

    return R.ok({
      conversations: conversationSummaries,
      pagination,
    });
  }

  private async toSummaryDto(
    conversation: Conversation,
  ): Promise<IConversationSummaryDto> {
    const messageCount = await this.getMessageCount(conversation);
    const title = conversation.get("title");
    const props = conversation.getProps();

    return {
      id: conversation.id.value.toString(),
      title: title.isSome() ? title.unwrap().value : null,
      lastMessage: null,
      messageCount,
      createdAt: conversation.get("createdAt").toISOString(),
      updatedAt: props.updatedAt ? props.updatedAt.toISOString() : null,
    };
  }

  private async getMessageCount(conversation: Conversation): Promise<number> {
    const countResult = await this.messageRepository.countByConversationId(
      conversation.id,
    );
    if (countResult.isFailure) {
      return 0;
    }
    return countResult.getValue();
  }
}
