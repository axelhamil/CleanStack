import type { UseCase } from "@packages/ddd-kit";
import { match, Result as R, type Result, UUID } from "@packages/ddd-kit";
import type {
  IGetConversationInputDto,
  IGetConversationOutputDto,
} from "@/application/dto/llm/get-conversation.dto";
import type {
  IConversationRepository,
  IConversationWithMessages,
} from "@/application/ports/conversation.repository.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

export class GetConversationUseCase
  implements UseCase<IGetConversationInputDto, IGetConversationOutputDto>
{
  constructor(
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async execute(
    input: IGetConversationInputDto,
  ): Promise<Result<IGetConversationOutputDto>> {
    const conversationIdResult = this.parseConversationId(input.conversationId);
    if (conversationIdResult.isFailure) {
      return R.fail(conversationIdResult.getError());
    }

    const conversationId = conversationIdResult.getValue();

    const result =
      await this.conversationRepository.getWithMessages(conversationId);
    if (result.isFailure) {
      return R.fail(result.getError());
    }

    return match<IConversationWithMessages, Result<IGetConversationOutputDto>>(
      result.getValue(),
      {
        Some: (data) => {
          if (!this.verifyOwnership(data.conversation, input.userId)) {
            return R.fail("Conversation access unauthorized");
          }
          return R.ok(this.toDto(data));
        },
        None: () => R.fail("Conversation not found"),
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

  private toDto(data: IConversationWithMessages): IGetConversationOutputDto {
    const { conversation, messages } = data;
    const title = conversation.get("title");
    const props = conversation.getProps();

    return {
      id: conversation.id.value.toString(),
      title: title.isSome() ? title.unwrap().value : null,
      messages: messages.map((m) => this.messageToDto(m)),
      createdAt: conversation.get("createdAt").toISOString(),
      updatedAt: props.updatedAt ? props.updatedAt.toISOString() : null,
    };
  }

  private messageToDto(
    message: Message,
  ): IGetConversationOutputDto["messages"][number] {
    return {
      id: message.id.value.toString(),
      role: message.get("role").value,
      content: message.get("content").value,
      createdAt: message.get("createdAt").toISOString(),
    };
  }
}
