import type { UseCase } from "@packages/ddd-kit";
import { match, Result as R, type Result } from "@packages/ddd-kit";
import type {
  IGetConversationInputDto,
  IGetConversationOutputDto,
} from "@/application/dto/llm/get-conversation.dto";
import type {
  IConversationRepository,
  IConversationWithMessages,
} from "@/application/ports/conversation.repository.port";
import {
  mapConversationToBaseDto,
  mapMessageToDto,
  parseConversationId,
  verifyConversationOwnership,
} from "./_shared/conversation.helper";

export class GetConversationUseCase
  implements UseCase<IGetConversationInputDto, IGetConversationOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(
    input: IGetConversationInputDto,
  ): Promise<Result<IGetConversationOutputDto>> {
    const conversationIdResult = parseConversationId(input.conversationId);
    if (conversationIdResult.isFailure) {
      return R.fail(conversationIdResult.getError());
    }

    const result = await this.conversationRepository.getWithMessages(
      conversationIdResult.getValue(),
    );
    if (result.isFailure) {
      return R.fail(result.getError());
    }

    return match<IConversationWithMessages, Result<IGetConversationOutputDto>>(
      result.getValue(),
      {
        Some: (data) => {
          if (!verifyConversationOwnership(data.conversation, input.userId)) {
            return R.fail("Conversation access unauthorized");
          }
          return R.ok(this.toDto(data));
        },
        None: () => R.fail("Conversation not found"),
      },
    );
  }

  private toDto(data: IConversationWithMessages): IGetConversationOutputDto {
    const baseDto = mapConversationToBaseDto(data.conversation);
    return {
      ...baseDto,
      messages: data.messages.map(mapMessageToDto),
    };
  }
}
