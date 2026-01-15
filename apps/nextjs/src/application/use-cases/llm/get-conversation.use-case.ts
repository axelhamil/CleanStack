import type { Result, UseCase } from "@packages/ddd-kit";
import type {
  IGetConversationInputDto,
  IGetConversationOutputDto,
} from "@/application/dto/llm/get-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";

export class GetConversationUseCase
  implements UseCase<IGetConversationInputDto, IGetConversationOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(
    _input: IGetConversationInputDto,
  ): Promise<Result<IGetConversationOutputDto>> {
    throw new Error("Not implemented");
  }
}
