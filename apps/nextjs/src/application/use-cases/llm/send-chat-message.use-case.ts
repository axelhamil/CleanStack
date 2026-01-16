import { match, Option, Result, type UseCase, UUID } from "@packages/ddd-kit";
import type {
  ISendChatMessageInputDto,
  ISendChatMessageOutputDto,
} from "@/application/dto/llm/send-chat-message.dto";
import type {
  IConversationRepository,
  IConversationWithMessages,
} from "@/application/ports/conversation.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  IGenerateTextResponse,
  ILLMMessage,
  ILLMProvider,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "@/domain/llm/conversation/value-objects/message-role.vo";
import { TokenUsage } from "@/domain/llm/conversation/value-objects/token-usage.vo";
import {
  calculateCompletionCost,
  checkUserBudget,
  getModelConfigOrFail,
  selectModelForCompletion,
} from "./_shared/completion.helper";
import { recordLLMUsage } from "./_shared/llm-usage.helper";

export class SendChatMessageUseCase
  implements UseCase<ISendChatMessageInputDto, ISendChatMessageOutputDto>
{
  constructor(
    private readonly llmProvider: ILLMProvider,
    private readonly modelRouter: IModelRouter,
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly usageRepository: ILLMUsageRepository,
    private readonly eventDispatcher: IEventDispatcher,
  ) {}

  async execute(
    input: ISendChatMessageInputDto,
  ): Promise<Result<ISendChatMessageOutputDto>> {
    const validationResult = this.validateInput(input);
    if (validationResult.isFailure) {
      return Result.fail(validationResult.getError());
    }

    // Check conversation ownership early if conversationId is provided
    const conversationResult = await this.getOrCreateConversation(input);
    if (conversationResult.isFailure) {
      return Result.fail(conversationResult.getError());
    }
    const { conversation, existingMessages, isNew } =
      conversationResult.getValue();

    const selectedModelResult = selectModelForCompletion(this.modelRouter, {
      maxBudget: input.options?.maxBudget,
      providers: input.options?.providers,
    });
    if (selectedModelResult.isFailure) {
      return Result.fail(selectedModelResult.getError());
    }
    const selectedModel = selectedModelResult.getValue();

    const modelConfigResult = getModelConfigOrFail(
      this.modelRouter,
      selectedModel,
    );
    if (modelConfigResult.isFailure) {
      return Result.fail(modelConfigResult.getError());
    }
    const modelConfig = modelConfigResult.getValue();

    const budgetCheckResult = await checkUserBudget(
      input.userId,
      this.usageRepository,
      input.options?.maxBudget,
    );
    if (budgetCheckResult.isFailure) {
      return Result.fail(budgetCheckResult.getError());
    }

    const messages = this.buildMessages(
      input.message,
      existingMessages,
      input.systemPrompt,
    );

    const llmResult = await this.llmProvider.generateText({
      model: selectedModel.model,
      messages,
    });

    if (llmResult.isFailure) {
      return Result.fail(llmResult.getError());
    }

    const llmResponse = llmResult.getValue();
    const cost = calculateCompletionCost(llmResponse.usage, modelConfig);

    const saveResult = await this.saveConversationAndMessages(
      conversation,
      isNew,
      input.message,
      llmResponse,
      selectedModel,
      cost,
    );

    if (saveResult.isFailure) {
      return Result.fail(saveResult.getError());
    }

    const { assistantMessage } = saveResult.getValue();

    await recordLLMUsage(
      {
        userId: input.userId,
        conversationId: String(conversation.id.value),
        selectedModel,
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
        cost,
      },
      this.usageRepository,
      this.eventDispatcher,
    );

    return Result.ok({
      conversationId: String(conversation.id.value),
      message: {
        id: String(assistantMessage.id.value),
        role: "assistant" as const,
        content: llmResponse.content,
      },
      usage: {
        inputTokens: llmResponse.usage.inputTokens,
        outputTokens: llmResponse.usage.outputTokens,
        cost: cost.amount,
      },
    });
  }

  private validateInput(input: ISendChatMessageInputDto): Result<void> {
    if (!input.message || input.message.trim().length === 0) {
      return Result.fail("message is required and cannot be empty");
    }
    return Result.ok(undefined);
  }

  private async getOrCreateConversation(
    input: ISendChatMessageInputDto,
  ): Promise<
    Result<{
      conversation: Conversation;
      existingMessages: Message[];
      isNew: boolean;
    }>
  > {
    if (input.conversationId) {
      const conversationId = ConversationId.create(
        new UUID(input.conversationId),
      );
      const result =
        await this.conversationRepository.getWithMessages(conversationId);

      if (result.isFailure) {
        return Result.fail(result.getError());
      }

      return match<
        IConversationWithMessages,
        Result<{
          conversation: Conversation;
          existingMessages: Message[];
          isNew: boolean;
        }>
      >(result.getValue(), {
        Some: ({ conversation, messages }) => {
          if (conversation.get("userId") !== input.userId) {
            return Result.fail("Conversation access unauthorized");
          }
          return Result.ok({
            conversation,
            existingMessages: messages,
            isNew: false,
          });
        },
        None: () => Result.fail("Conversation not found"),
      });
    }

    const conversation = Conversation.create({
      userId: input.userId,
      title: Option.none(),
      metadata: Option.none(),
    });

    return Result.ok({
      conversation,
      existingMessages: [],
      isNew: true,
    });
  }

  private buildMessages(
    userMessage: string,
    existingMessages: Message[],
    systemPrompt?: string,
  ): ILLMMessage[] {
    const messages: ILLMMessage[] = [];

    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    for (const msg of existingMessages) {
      messages.push({
        role: msg.get("role").value as "user" | "assistant" | "system",
        content: msg.get("content").value,
      });
    }

    messages.push({ role: "user", content: userMessage });

    return messages;
  }

  private async saveConversationAndMessages(
    conversation: Conversation,
    isNew: boolean,
    userMessageContent: string,
    llmResponse: IGenerateTextResponse,
    selectedModel: ISelectedModel,
    cost: { amount: number; currency: string },
  ): Promise<Result<{ userMessage: Message; assistantMessage: Message }>> {
    if (isNew) {
      const createResult =
        await this.conversationRepository.create(conversation);
      if (createResult.isFailure) {
        return Result.fail(createResult.getError());
      }
    } else {
      conversation.markUpdated();
      const updateResult =
        await this.conversationRepository.update(conversation);
      if (updateResult.isFailure) {
        return Result.fail(updateResult.getError());
      }
    }

    const userRoleResult = MessageRole.create("user" as MessageRoleType);
    const userContentResult = MessageContent.create(userMessageContent);

    if (userRoleResult.isFailure || userContentResult.isFailure) {
      return Result.fail("Failed to create user message");
    }

    const userMessage = Message.create({
      conversationId: conversation.id,
      role: userRoleResult.getValue(),
      content: userContentResult.getValue(),
      model: Option.none(),
      tokenUsage: Option.none(),
      cost: Option.none(),
    });

    const userMessageSaveResult =
      await this.messageRepository.create(userMessage);
    if (userMessageSaveResult.isFailure) {
      return Result.fail(userMessageSaveResult.getError());
    }

    const assistantRoleResult = MessageRole.create(
      "assistant" as MessageRoleType,
    );
    const assistantContentResult = MessageContent.create(llmResponse.content);
    const tokenUsageResult = TokenUsage.create({
      inputTokens: llmResponse.usage.inputTokens,
      outputTokens: llmResponse.usage.outputTokens,
      totalTokens: llmResponse.usage.totalTokens,
    });
    const costResult = Cost.create({
      amount: cost.amount,
      currency: cost.currency,
    });

    if (
      assistantRoleResult.isFailure ||
      assistantContentResult.isFailure ||
      tokenUsageResult.isFailure ||
      costResult.isFailure
    ) {
      return Result.fail("Failed to create assistant message");
    }

    const assistantMessage = Message.create({
      conversationId: conversation.id,
      role: assistantRoleResult.getValue(),
      content: assistantContentResult.getValue(),
      model: Option.some(selectedModel.model),
      tokenUsage: Option.some(tokenUsageResult.getValue()),
      cost: Option.some(costResult.getValue()),
    });

    const assistantMessageSaveResult =
      await this.messageRepository.create(assistantMessage);
    if (assistantMessageSaveResult.isFailure) {
      return Result.fail(assistantMessageSaveResult.getError());
    }

    await this.eventDispatcher.dispatchAll(conversation.domainEvents);
    conversation.clearEvents();

    return Result.ok({ userMessage, assistantMessage });
  }
}
