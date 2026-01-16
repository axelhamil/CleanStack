import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ISendChatMessageInputDto } from "@/application/dto/llm/send-chat-message.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  IGenerateTextResponse,
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import { SendChatMessageUseCase } from "@/application/use-cases/llm/send-chat-message.use-case";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import { MessageRole } from "@/domain/llm/conversation/value-objects/message-role.vo";
import { UserId } from "@/domain/user/user-id";

describe("SendChatMessageUseCase", () => {
  let useCase: SendChatMessageUseCase;
  let mockLLMProvider: {
    generateText: ReturnType<typeof vi.fn>;
    streamText: ReturnType<typeof vi.fn>;
    estimateTokens: ReturnType<typeof vi.fn>;
    getAvailableModels: ReturnType<typeof vi.fn>;
  };
  let mockModelRouter: {
    selectOptimalModel: ReturnType<typeof vi.fn>;
    getModelConfig: ReturnType<typeof vi.fn>;
    getAllModels: ReturnType<typeof vi.fn>;
  };
  let mockUsageRepository: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findBy: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    getTotalCostByUser: ReturnType<typeof vi.fn>;
    getTotalCostGlobal: ReturnType<typeof vi.fn>;
    getUsageStats: ReturnType<typeof vi.fn>;
  };
  let mockConversationRepository: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findBy: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    findByUserId: ReturnType<typeof vi.fn>;
    getWithMessages: ReturnType<typeof vi.fn>;
  };
  let mockMessageRepository: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findBy: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    findByConversationId: ReturnType<typeof vi.fn>;
    countByConversationId: ReturnType<typeof vi.fn>;
  };
  let mockEventDispatcher: IEventDispatcher;

  const defaultInput: ISendChatMessageInputDto = {
    message: "Hello, how are you?",
    userId: "user-123",
  };

  const defaultSelectedModel: ISelectedModel = {
    provider: "openai",
    model: "gpt-4o-mini",
    estimatedCostPer1kTokens: {
      input: 0.00015,
      output: 0.0006,
    },
  };

  const defaultModelConfig: IModelConfig = {
    provider: "openai",
    model: "gpt-4o-mini",
    costPer1kIn: 0.00015,
    costPer1kOut: 0.0006,
    capabilities: ["text", "json"],
    maxTokens: 128000,
    enabled: true,
  };

  const defaultLLMResponse: IGenerateTextResponse = {
    content: "I'm doing well, thank you for asking!",
    usage: {
      inputTokens: 25,
      outputTokens: 12,
      totalTokens: 37,
    },
    model: "gpt-4o-mini",
    finishReason: "stop",
  };

  function createMockConversation(userId: string, id?: string): Conversation {
    const conversationId = id ? ConversationId.create(new UUID(id)) : undefined;
    return Conversation.create(
      {
        userId: UserId.create(new UUID(userId)),
        title: Option.none(),
        metadata: Option.none(),
      },
      conversationId,
    );
  }

  function createMockMessage(
    conversationId: ConversationId,
    role: "user" | "assistant" | "system",
    content: string,
  ): Message {
    return Message.create({
      conversationId,
      role: MessageRole.create(
        role as "user" | "assistant" | "system",
      ).getValue(),
      content: MessageContent.create(content as string).getValue(),
      model: Option.none(),
      tokenUsage: Option.none(),
      cost: Option.none(),
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();

    mockLLMProvider = {
      generateText: vi.fn(),
      streamText: vi.fn(),
      estimateTokens: vi.fn(),
      getAvailableModels: vi.fn(),
    };

    mockModelRouter = {
      selectOptimalModel: vi.fn(),
      getModelConfig: vi.fn(),
      getAllModels: vi.fn(),
    };

    mockUsageRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      getTotalCostByUser: vi.fn(),
      getTotalCostGlobal: vi.fn(),
      getUsageStats: vi.fn(),
    };

    mockConversationRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      getWithMessages: vi.fn(),
    };

    mockMessageRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByConversationId: vi.fn(),
      countByConversationId: vi.fn(),
    };

    mockEventDispatcher = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      dispatch: vi.fn().mockResolvedValue(undefined),
      dispatchAll: vi.fn().mockResolvedValue(undefined),
      isSubscribed: vi.fn(),
      getHandlerCount: vi.fn(),
      clearHandlers: vi.fn(),
    };

    useCase = new SendChatMessageUseCase(
      mockLLMProvider as unknown as ILLMProvider,
      mockModelRouter as unknown as IModelRouter,
      mockConversationRepository as unknown as IConversationRepository,
      mockMessageRepository as unknown as IMessageRepository,
      mockUsageRepository as unknown as ILLMUsageRepository,
      mockEventDispatcher,
    );
  });

  describe("happy path - new conversation", () => {
    it("should create a new conversation when conversationId is not provided", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(mockConversationRepository.create).toHaveBeenCalledOnce();
    });

    it("should return conversationId in output", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().conversationId).toBeDefined();
      expect(typeof result.getValue().conversationId).toBe("string");
    });

    it("should create user message with input content", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute(defaultInput);

      // Should create 2 messages: user message and assistant message
      expect(mockMessageRepository.create).toHaveBeenCalledTimes(2);
    });

    it("should return assistant response message", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.message.role).toBe("assistant");
      expect(output.message.content).toBe(defaultLLMResponse.content);
    });
  });

  describe("happy path - existing conversation", () => {
    it("should use existing conversation when conversationId is provided", async () => {
      const existingConversationId = "conv-123";
      const existingConversation = createMockConversation(
        "user-123",
        existingConversationId,
      );

      mockConversationRepository.getWithMessages.mockResolvedValue(
        Result.ok(
          Option.some({
            conversation: existingConversation,
            messages: [],
          }),
        ),
      );
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.update.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute({
        ...defaultInput,
        conversationId: existingConversationId,
      });

      expect(result.isSuccess).toBe(true);
      expect(mockConversationRepository.create).not.toHaveBeenCalled();
      expect(mockConversationRepository.getWithMessages).toHaveBeenCalledOnce();
    });

    it("should include existing messages in LLM context", async () => {
      const existingConversationId = "conv-123";
      const existingConversation = createMockConversation(
        "user-123",
        existingConversationId,
      );
      const existingMessage = createMockMessage(
        existingConversation.id,
        "user",
        "Previous message",
      );

      mockConversationRepository.getWithMessages.mockResolvedValue(
        Result.ok(
          Option.some({
            conversation: existingConversation,
            messages: [existingMessage],
          }),
        ),
      );
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.update.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        conversationId: existingConversationId,
      });

      // LLM should receive messages including history
      expect(mockLLMProvider.generateText).toHaveBeenCalledOnce();
      const llmCall = mockLLMProvider.generateText.mock.calls[0]?.[0];
      expect(llmCall?.messages.length).toBeGreaterThan(1);
    });
  });

  describe("ownership verification", () => {
    it("should fail when conversation belongs to different user", async () => {
      const existingConversationId = "conv-123";
      const existingConversation = createMockConversation(
        "other-user",
        existingConversationId,
      );

      mockConversationRepository.getWithMessages.mockResolvedValue(
        Result.ok(
          Option.some({
            conversation: existingConversation,
            messages: [],
          }),
        ),
      );

      const result = await useCase.execute({
        ...defaultInput,
        conversationId: existingConversationId,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("unauthorized");
    });

    it("should fail when conversation does not exist", async () => {
      mockConversationRepository.getWithMessages.mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        ...defaultInput,
        conversationId: "non-existent",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });
  });

  describe("usage tracking", () => {
    it("should record usage after completion", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute(defaultInput);

      expect(mockUsageRepository.create).toHaveBeenCalledOnce();
    });

    it("should return usage stats in output", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.usage.inputTokens).toBe(
        defaultLLMResponse.usage.inputTokens,
      );
      expect(output.usage.outputTokens).toBe(
        defaultLLMResponse.usage.outputTokens,
      );
      expect(output.usage.cost).toBeGreaterThan(0);
    });

    it("should dispatch events after save", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute(defaultInput);

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalled();
    });
  });

  describe("budget checks", () => {
    it("should fail when daily budget is exceeded", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(100));

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("budget");
    });

    it("should respect custom maxBudget option", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(5));

      const result = await useCase.execute({
        ...defaultInput,
        options: { maxBudget: 5 },
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("budget");
    });
  });

  describe("system prompt", () => {
    it("should include system prompt in LLM call when provided", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        systemPrompt: "You are a helpful assistant",
      });

      expect(mockLLMProvider.generateText).toHaveBeenCalledOnce();
      const llmCall = mockLLMProvider.generateText.mock.calls[0]?.[0];
      expect(
        llmCall?.messages.some((m: { role: string }) => m.role === "system"),
      ).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should fail when message is empty", async () => {
      const result = await useCase.execute({
        ...defaultInput,
        message: "",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("message");
    });

    it("should fail when model selection fails", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.fail("No capable model found"),
      );

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("model");
    });

    it("should fail when model config is not found", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(Option.none());

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("config");
    });

    it("should fail when LLM provider returns error", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.fail("LLM service unavailable"),
      );

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
    });

    it("should fail when conversation repository returns error", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
    });

    it("should fail when message repository returns error", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(
        Result.fail("Database error"),
      );

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("provider selection", () => {
    it("should pass preferred providers to model router", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));
      mockLLMProvider.generateText.mockResolvedValue(
        Result.ok(defaultLLMResponse),
      );
      mockConversationRepository.create.mockResolvedValue(Result.ok({}));
      mockMessageRepository.create.mockResolvedValue(Result.ok({}));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        options: { providers: ["anthropic"] },
      });

      expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
        expect.objectContaining({
          preferredProviders: ["anthropic"],
        }),
      );
    });
  });
});
