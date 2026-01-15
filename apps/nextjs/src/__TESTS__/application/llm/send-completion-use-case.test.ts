import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ISendCompletionInputDto } from "@/application/dto/llm/send-completion.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  IGenerateTextResponse,
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import { SendCompletionUseCase } from "@/application/use-cases/llm/send-completion.use-case";
import type { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";

describe("SendCompletionUseCase", () => {
  let useCase: SendCompletionUseCase;
  let mockLLMProvider: ILLMProvider;
  let mockModelRouter: IModelRouter;
  let mockUsageRepository: ILLMUsageRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: ISendCompletionInputDto = {
    prompt: "Hello, how are you?",
    systemPrompt: "You are a helpful assistant",
    options: {
      capabilities: ["text"],
      temperature: 0.7,
    },
    userId: "user-123",
  };

  const mockSelectedModel: ISelectedModel = {
    provider: "openai",
    model: "gpt-4o-mini",
    estimatedCostPer1kTokens: {
      input: 0.00015,
      output: 0.0006,
    },
  };

  const mockModelConfig: IModelConfig = {
    provider: "openai",
    model: "gpt-4o-mini",
    costPer1kIn: 0.00015,
    costPer1kOut: 0.0006,
    capabilities: ["text", "json"],
    maxTokens: 128000,
    enabled: true,
  };

  const mockLLMResponse: IGenerateTextResponse = {
    content: "I'm doing well, thank you for asking!",
    usage: {
      inputTokens: 25,
      outputTokens: 12,
      totalTokens: 37,
    },
    model: "gpt-4o-mini",
    finishReason: "stop",
  };

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

    mockEventDispatcher = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
      isSubscribed: vi.fn(),
      getHandlerCount: vi.fn(),
      clearHandlers: vi.fn(),
    };

    useCase = new SendCompletionUseCase(
      mockLLMProvider,
      mockModelRouter,
      mockUsageRepository,
      mockEventDispatcher,
    );
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return success with completion when all steps succeed", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
          content: mockLLMResponse.content,
          model: mockLLMResponse.model,
          provider: mockSelectedModel.provider,
          usage: {
            inputTokens: mockLLMResponse.usage.inputTokens,
            outputTokens: mockLLMResponse.usage.outputTokens,
            totalTokens: mockLLMResponse.usage.totalTokens,
          },
          cost: expect.objectContaining({
            amount: expect.any(Number),
            currency: "USD",
          }),
        });
      });

      it("should select optimal model based on capabilities", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        await useCase.execute(validInput);

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            capabilities: ["text"],
            strategy: "cheapest",
          }),
        );
      });

      it("should pass correct messages to LLM provider", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        await useCase.execute(validInput);

        expect(mockLLMProvider.generateText).toHaveBeenCalledWith(
          expect.objectContaining({
            model: mockSelectedModel.model,
            messages: expect.arrayContaining([
              { role: "system", content: validInput.systemPrompt },
              { role: "user", content: validInput.prompt },
            ]),
            temperature: 0.7,
          }),
        );
      });

      it("should record usage after successful completion", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        await useCase.execute(validInput);

        expect(mockUsageRepository.create).toHaveBeenCalledOnce();
      });

      it("should dispatch UsageRecordedEvent after saving", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        await useCase.execute(validInput);

        expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              eventType: "llm-usage.recorded",
            }),
          ]),
        );
      });
    });

    describe("budget checks", () => {
      it("should check user budget before making request", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        await useCase.execute(validInput);

        expect(mockUsageRepository.getTotalCostByUser).toHaveBeenCalledWith(
          "user-123",
          "day",
        );
      });

      it("should fail when user daily budget is exceeded", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(100),
        );

        const result = await useCase.execute({
          ...validInput,
          options: { ...validInput.options, maxBudget: 50 },
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("budget");
        expect(mockLLMProvider.generateText).not.toHaveBeenCalled();
      });

      it("should skip budget check when no userId provided", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        const result = await useCase.execute({
          prompt: "Test prompt",
        });

        expect(result.isSuccess).toBe(true);
        expect(mockUsageRepository.getTotalCostByUser).not.toHaveBeenCalled();
      });
    });

    describe("model selection errors", () => {
      it("should fail when no capable model is available", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.fail("No model available with required capabilities"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("No model available");
        expect(mockLLMProvider.generateText).not.toHaveBeenCalled();
      });

      it("should fail when model config not found", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.none(),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("config");
      });
    });

    describe("provider errors", () => {
      it("should fail when LLM provider returns error", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.fail("Provider rate limit exceeded"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("rate limit");
      });

      it("should not record usage when provider fails", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.fail("Provider error"),
        );

        await useCase.execute(validInput);

        expect(mockUsageRepository.create).not.toHaveBeenCalled();
      });
    });

    describe("validation errors", () => {
      it("should fail when prompt is empty", async () => {
        const result = await useCase.execute({
          ...validInput,
          prompt: "",
        });

        expect(result.isFailure).toBe(true);
        expect(mockModelRouter.selectOptimalModel).not.toHaveBeenCalled();
      });

      it("should fail when prompt is only whitespace", async () => {
        const result = await useCase.execute({
          ...validInput,
          prompt: "   ",
        });

        expect(result.isFailure).toBe(true);
      });
    });

    describe("variable substitution", () => {
      it("should substitute variables in prompt", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        await useCase.execute({
          prompt: "Hello {{name}}, how are you?",
          variables: { name: "John" },
        });

        expect(mockLLMProvider.generateText).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: expect.arrayContaining([
              { role: "user", content: "Hello John, how are you?" },
            ]),
          }),
        );
      });
    });

    describe("cost calculation", () => {
      it("should calculate cost based on token usage and model pricing", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.ok({} as LLMUsage),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        const expectedCost =
          (mockLLMResponse.usage.inputTokens / 1000) *
            mockModelConfig.costPer1kIn +
          (mockLLMResponse.usage.outputTokens / 1000) *
            mockModelConfig.costPer1kOut;
        expect(output.cost.amount).toBeCloseTo(expectedCost, 6);
      });
    });

    describe("repository errors", () => {
      it("should fail when usage repository returns error on budget check", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("Database");
      });

      it("should still return success even if usage recording fails", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockModelConfig),
        );
        vi.mocked(mockUsageRepository.getTotalCostByUser).mockResolvedValue(
          Result.ok(0),
        );
        vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
          Result.ok(mockLLMResponse),
        );
        vi.mocked(mockUsageRepository.create).mockResolvedValue(
          Result.fail("Database error"),
        );
        vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
          Result.ok(undefined),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
      });
    });
  });
});
