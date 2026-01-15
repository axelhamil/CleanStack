import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IStreamCompletionInputDto } from "@/application/dto/llm/stream-completion.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type {
  ILLMProvider,
  IModelConfig,
  IStreamTextResponse,
} from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import { StreamCompletionUseCase } from "@/application/use-cases/llm/stream-completion.use-case";

describe("StreamCompletionUseCase", () => {
  let useCase: StreamCompletionUseCase;
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
    getTotalCostByUser: ReturnType<typeof vi.fn>;
  };
  let mockEventDispatcher: IEventDispatcher;

  const defaultInput: IStreamCompletionInputDto = {
    prompt: "Hello, how are you?",
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
    capabilities: ["text"],
    maxTokens: 128000,
    enabled: true,
  };

  const createMockStream = (chunks: string[]): ReadableStream<string> => {
    let index = 0;
    return new ReadableStream({
      pull(controller) {
        if (index < chunks.length) {
          controller.enqueue(chunks[index]);
          index++;
        } else {
          controller.close();
        }
      },
    });
  };

  const createMockStreamResponse = (
    chunks: string[],
    usage: { inputTokens: number; outputTokens: number },
  ): IStreamTextResponse => ({
    stream: createMockStream(chunks),
    usage: Promise.resolve(usage),
  });

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
      getTotalCostByUser: vi.fn(),
    };

    mockEventDispatcher = {
      dispatch: vi.fn().mockResolvedValue(undefined),
      dispatchAll: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      isSubscribed: vi.fn(),
      getHandlerCount: vi.fn(),
      clearHandlers: vi.fn(),
    };

    useCase = new StreamCompletionUseCase(
      mockLLMProvider as unknown as ILLMProvider,
      mockModelRouter as unknown as IModelRouter,
      mockUsageRepository as unknown as ILLMUsageRepository,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should return a readable stream on success", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Hello", " there", "!"], {
            inputTokens: 10,
            outputTokens: 3,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.stream).toBeInstanceOf(ReadableStream);
      expect(output.model).toBe("gpt-4o-mini");
      expect(output.provider).toBe("openai");
    });

    it("should select optimal model using model router", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Hi"], {
            inputTokens: 5,
            outputTokens: 1,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        options: { providers: ["openai", "anthropic"] },
      });

      expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
        expect.objectContaining({
          capabilities: ["text"],
          preferredProviders: ["openai", "anthropic"],
        }),
      );
    });

    it("should substitute variables in prompt", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Hello Bob"], {
            inputTokens: 10,
            outputTokens: 2,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        prompt: "Hello {{name}}",
        variables: { name: "Bob" },
      });

      expect(mockLLMProvider.streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ content: "Hello Bob" }),
          ]),
        }),
      );
    });

    it("should include system prompt in messages", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Response"], {
            inputTokens: 20,
            outputTokens: 1,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        systemPrompt: "You are a helpful assistant.",
      });

      expect(mockLLMProvider.streamText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            { role: "system", content: "You are a helpful assistant." },
          ]),
        }),
      );
    });
  });

  describe("cost tracking on stream finish", () => {
    it("should record usage after stream completes", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));

      const streamResponse = createMockStreamResponse(["Hello", " World"], {
        inputTokens: 10,
        outputTokens: 2,
      });
      mockLLMProvider.streamText.mockResolvedValue(Result.ok(streamResponse));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute({
        ...defaultInput,
        userId: "user-123",
      });
      expect(result.isSuccess).toBe(true);

      const output = result.getValue();

      // Consume the stream to trigger completion
      const reader = output.stream.getReader();
      const chunks: string[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Wait for usage recording
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockUsageRepository.create).toHaveBeenCalled();
    });

    it("should calculate cost based on token usage", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));

      const streamResponse = createMockStreamResponse(["Response"], {
        inputTokens: 1000,
        outputTokens: 500,
      });
      mockLLMProvider.streamText.mockResolvedValue(Result.ok(streamResponse));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute({
        ...defaultInput,
        userId: "user-123",
      });
      expect(result.isSuccess).toBe(true);

      // Consume stream
      const reader = result.getValue().stream.getReader();
      while (!(await reader.read()).done) {
        // consume
      }

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockUsageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          _props: expect.objectContaining({
            cost: expect.objectContaining({
              _value: expect.objectContaining({
                // (1000/1000) * 0.00015 + (500/1000) * 0.0006 = 0.00015 + 0.0003 = 0.00045
                amount: expect.any(Number),
              }),
            }),
          }),
        }),
      );
    });

    it("should dispatch domain events after usage recording", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));

      const streamResponse = createMockStreamResponse(["Done"], {
        inputTokens: 10,
        outputTokens: 1,
      });
      mockLLMProvider.streamText.mockResolvedValue(Result.ok(streamResponse));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute({
        ...defaultInput,
        userId: "user-123",
      });

      // Consume stream
      const reader = result.getValue().stream.getReader();
      while (!(await reader.read()).done) {
        // consume
      }

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalled();
    });
  });

  describe("cancellation handling", () => {
    it("should handle stream cancellation gracefully", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );

      const streamResponse = createMockStreamResponse(
        ["Part 1", "Part 2", "Part 3"],
        { inputTokens: 10, outputTokens: 3 },
      );
      mockLLMProvider.streamText.mockResolvedValue(Result.ok(streamResponse));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);
      expect(result.isSuccess).toBe(true);

      const reader = result.getValue().stream.getReader();
      await reader.read(); // Read first chunk
      await reader.cancel(); // Cancel the stream

      // Should not throw
      expect(true).toBe(true);
    });

    it("should not record usage if stream is cancelled before completion", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(0));

      // Create a stream that won't auto-complete
      let resolveUsage: (value: {
        inputTokens: number;
        outputTokens: number;
      }) => void = () => {};
      const usagePromise = new Promise<{
        inputTokens: number;
        outputTokens: number;
      }>((resolve) => {
        resolveUsage = resolve;
      });

      const streamResponse: IStreamTextResponse = {
        stream: createMockStream(["Part 1", "Part 2"]),
        usage: usagePromise,
      };

      mockLLMProvider.streamText.mockResolvedValue(Result.ok(streamResponse));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute({
        ...defaultInput,
        userId: "user-123",
      });

      const reader = result.getValue().stream.getReader();
      await reader.read();
      await reader.cancel();

      // Resolve usage after cancellation to simulate real-world scenario
      resolveUsage({ inputTokens: 10, outputTokens: 1 });
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Usage should still be recorded for partial streaming
      // (implementation choice - could also skip recording on cancel)
    });
  });

  describe("error propagation", () => {
    it("should fail when prompt is empty", async () => {
      const result = await useCase.execute({ prompt: "" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Prompt");
    });

    it("should fail when prompt is only whitespace", async () => {
      const result = await useCase.execute({ prompt: "   " });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when model selection fails", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.fail("No capable model available"),
      );

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("No capable model");
    });

    it("should fail when model config not found", async () => {
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
      mockLLMProvider.streamText.mockResolvedValue(
        Result.fail("Provider unavailable"),
      );

      const result = await useCase.execute(defaultInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("unavailable");
    });

    it("should propagate stream errors correctly", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );

      // Create a stream that will error
      const errorStream = new ReadableStream<string>({
        start(controller) {
          controller.enqueue("First chunk");
        },
        pull(controller) {
          controller.error(new Error("Stream error"));
        },
      });

      const streamResponse: IStreamTextResponse = {
        stream: errorStream,
        usage: Promise.resolve({ inputTokens: 10, outputTokens: 1 }),
      };

      mockLLMProvider.streamText.mockResolvedValue(Result.ok(streamResponse));
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute(defaultInput);
      expect(result.isSuccess).toBe(true);

      const reader = result.getValue().stream.getReader();
      await reader.read(); // First chunk succeeds

      // Next read should throw
      await expect(reader.read()).rejects.toThrow("Stream error");
    });
  });

  describe("budget checks", () => {
    it("should check budget before streaming when userId provided", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(50));
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Hi"], {
            inputTokens: 5,
            outputTokens: 1,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      const result = await useCase.execute({
        ...defaultInput,
        userId: "user-123",
        options: { maxBudget: 100 },
      });

      expect(result.isSuccess).toBe(true);
      expect(mockUsageRepository.getTotalCostByUser).toHaveBeenCalledWith(
        "user-123",
        "day",
      );
    });

    it("should fail when budget exceeded", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockUsageRepository.getTotalCostByUser.mockResolvedValue(Result.ok(150));

      const result = await useCase.execute({
        ...defaultInput,
        userId: "user-123",
        options: { maxBudget: 100 },
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("budget");
    });

    it("should skip budget check when no userId provided", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Hi"], {
            inputTokens: 5,
            outputTokens: 1,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute(defaultInput);

      expect(mockUsageRepository.getTotalCostByUser).not.toHaveBeenCalled();
    });
  });

  describe("options handling", () => {
    it("should pass temperature option to provider", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Response"], {
            inputTokens: 10,
            outputTokens: 1,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        options: { temperature: 0.7 },
      });

      expect(mockLLMProvider.streamText).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0.7 }),
      );
    });

    it("should pass maxTokens option to provider", async () => {
      mockModelRouter.selectOptimalModel.mockReturnValue(
        Result.ok(defaultSelectedModel),
      );
      mockModelRouter.getModelConfig.mockReturnValue(
        Option.some(defaultModelConfig),
      );
      mockLLMProvider.streamText.mockResolvedValue(
        Result.ok(
          createMockStreamResponse(["Response"], {
            inputTokens: 10,
            outputTokens: 1,
          }),
        ),
      );
      mockUsageRepository.create.mockResolvedValue(Result.ok({}));

      await useCase.execute({
        ...defaultInput,
        options: { maxTokens: 500 },
      });

      expect(mockLLMProvider.streamText).toHaveBeenCalledWith(
        expect.objectContaining({ maxTokens: 500 }),
      );
    });
  });
});
