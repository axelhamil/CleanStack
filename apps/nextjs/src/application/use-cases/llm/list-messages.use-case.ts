import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IListMessagesInputDto,
  IListMessagesOutputDto,
} from "@/application/dto/llm/list-messages.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";

export class ListMessagesUseCase
  implements UseCase<IListMessagesInputDto, IListMessagesOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
  ) {}

  async execute(
    _input: IListMessagesInputDto,
  ): Promise<Result<IListMessagesOutputDto>> {
    throw new Error("Not implemented");
  }
}
