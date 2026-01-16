import type { UseCase } from "@packages/ddd-kit";
import { Result as R, type Result } from "@packages/ddd-kit";
import type {
  IListMessagesInputDto,
  IListMessagesOutputDto,
} from "@/application/dto/llm/list-messages.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type { ConversationId } from "@/domain/llm/conversation/conversation-id";
import {
  findConversationWithOwnershipCheck,
  mapMessageToDto,
} from "./_shared/conversation.helper";

export class ListMessagesUseCase
  implements UseCase<IListMessagesInputDto, IListMessagesOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    input: IListMessagesInputDto,
  ): Promise<Result<IListMessagesOutputDto>> {
    const conversationResult = await findConversationWithOwnershipCheck(
      input.conversationId,
      input.userId,
      this.conversationRepository,
    );
    if (conversationResult.isFailure) {
      return R.fail(conversationResult.getError());
    }

    const conversation = conversationResult.getValue();
    return this.fetchMessages(conversation.id, input.pagination);
  }

  private async fetchMessages(
    conversationId: ConversationId,
    pagination?: { page: number; limit: number },
  ): Promise<Result<IListMessagesOutputDto>> {
    const messagesResult = await this.messageRepository.findByConversationId(
      conversationId,
      pagination,
    );
    if (messagesResult.isFailure) {
      return R.fail(messagesResult.getError());
    }

    const { data: messages, pagination: paginationResult } =
      messagesResult.getValue();

    return R.ok({
      messages: messages.map(mapMessageToDto),
      pagination: paginationResult,
    });
  }
}
