import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IDeleteConversationInputDto,
  IDeleteConversationOutputDto,
} from "@/application/dto/llm/delete-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";

export class DeleteConversationUseCase
  implements UseCase<IDeleteConversationInputDto, IDeleteConversationOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    _input: IDeleteConversationInputDto,
  ): Promise<Result<IDeleteConversationOutputDto>> {
    throw new Error("Not implemented");
  }
}
