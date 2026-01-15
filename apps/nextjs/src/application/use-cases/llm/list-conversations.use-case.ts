import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IListConversationsInputDto,
  IListConversationsOutputDto,
} from "@/application/dto/llm/list-conversations.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";

export class ListConversationsUseCase
  implements UseCase<IListConversationsInputDto, IListConversationsOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    _input: IListConversationsInputDto,
  ): Promise<Result<IListConversationsOutputDto>> {
    throw new Error("Not implemented");
  }
}
