import type { UseCase } from "@packages/ddd-kit";
import { match, Result as R, type Result, UUID } from "@packages/ddd-kit";
import type {
  IListMessagesInputDto,
  IListMessagesOutputDto,
} from "@/application/dto/llm/list-messages.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import type { Message } from "@/domain/llm/conversation/entities/message.entity";

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

    return match<Conversation, Promise<Result<IListMessagesOutputDto>>>(
      conversationResult.getValue(),
      {
        Some: async (conversation) => {
          if (!this.verifyOwnership(conversation, input.userId)) {
            return R.fail("Conversation access unauthorized");
          }
          return this.fetchMessages(conversationId, input.pagination);
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
      messages: messages.map((m) => this.messageToDto(m)),
      pagination: paginationResult,
    });
  }

  private messageToDto(
    message: Message,
  ): IListMessagesOutputDto["messages"][number] {
    return {
      id: message.id.value.toString(),
      role: message.get("role").value,
      content: message.get("content").value,
      createdAt: message.get("createdAt").toISOString(),
    };
  }
}
