import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEstimateCostInputDto } from "@/application/dto/llm/estimate-cost.dto";
import type {
  ILLMProvider,
  IModelConfig,
} from "@/application/ports/llm.provider.port";
import type { IModelRouter } from "@/application/ports/model-router.port";
import { EstimateCostUseCase } from "@/application/use-cases/llm/estimate-cost.use-case";

describe("EstimateCostUseCase", () => {
  let useCase: EstimateCostUseCase;
  let mockLLMProvider: ILLMProvider;
  let mockModelRouter: IModelRouter;

  const validInput: IEstimateCostInputDto = {
    text: "Hello, how are you doing today?",
  };

  const mockOpenAIModel: IModelConfig = {
    provider: "openai",
    model: "gpt-4o-mini",
    costPer1kIn: 0.00015,
    costPer1kOut: 0.0006,
    capabilities: ["text", "json"],
    maxTokens: 128000,
    enabled: true,
  };

  const mockAnthropicModel: IModelConfig = {
    provider: "anthropic",
    model: "claude-3-haiku",
    costPer1kIn: 0.00025,
    costPer1kOut: 0.00125,
    capabilities: ["text", "json", "vision"],
    maxTokens: 200000,
    enabled: true,
  };

  const mockExpensiveModel: IModelConfig = {
    provider: "openai",
    model: "gpt-4o",
    costPer1kIn: 0.0025,
    costPer1kOut: 0.01,
    capabilities: ["text", "json", "vision"],
    maxTokens: 128000,
    enabled: true,
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

    useCase = new EstimateCostUseCase(mockLLMProvider, mockModelRouter);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return estimated tokens and cost range", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(100),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
          mockAnthropicModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.estimatedTokens).toBe(100);
        expect(output.estimatedCost).toHaveProperty("min");
        expect(output.estimatedCost).toHaveProperty("max");
        expect(output.estimatedCost).toHaveProperty("currency");
      });

      it("should estimate tokens using LLM provider", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(50),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
        ]);

        await useCase.execute(validInput);

        expect(mockLLMProvider.estimateTokens).toHaveBeenCalledWith(
          validInput.text,
        );
      });

      it("should return correct token count", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(250),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().estimatedTokens).toBe(250);
      });
    });

    describe("cost calculation", () => {
      it("should calculate min cost from cheapest model", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(1000),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
          mockExpensiveModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const expectedMinCost =
          (1000 / 1000) * mockOpenAIModel.costPer1kIn +
          (1000 / 1000) * mockOpenAIModel.costPer1kOut;
        expect(result.getValue().estimatedCost.min).toBeCloseTo(
          expectedMinCost,
          6,
        );
      });

      it("should calculate max cost from most expensive model", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(1000),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
          mockExpensiveModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const expectedMaxCost =
          (1000 / 1000) * mockExpensiveModel.costPer1kIn +
          (1000 / 1000) * mockExpensiveModel.costPer1kOut;
        expect(result.getValue().estimatedCost.max).toBeCloseTo(
          expectedMaxCost,
          6,
        );
      });

      it("should return USD as currency", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(100),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().estimatedCost.currency).toBe("USD");
      });

      it("should return same min and max when only one model available", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(500),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().estimatedCost.min).toBe(
          result.getValue().estimatedCost.max,
        );
      });
    });

    describe("specific model estimation", () => {
      it("should estimate cost for specific model when provided", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(500),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.some(mockAnthropicModel),
        );

        const result = await useCase.execute({
          text: validInput.text,
          model: "claude-3-haiku",
        });

        expect(result.isSuccess).toBe(true);
        const expectedCost =
          (500 / 1000) * mockAnthropicModel.costPer1kIn +
          (500 / 1000) * mockAnthropicModel.costPer1kOut;
        expect(result.getValue().estimatedCost.min).toBeCloseTo(
          expectedCost,
          6,
        );
        expect(result.getValue().estimatedCost.max).toBeCloseTo(
          expectedCost,
          6,
        );
      });

      it("should fail when specific model not found", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(100),
        );
        vi.mocked(mockModelRouter.getModelConfig).mockReturnValue(
          Option.none(),
        );

        const result = await useCase.execute({
          text: validInput.text,
          model: "nonexistent-model",
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("not found");
      });
    });

    describe("validation errors", () => {
      it("should fail when text is empty", async () => {
        const result = await useCase.execute({
          text: "",
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("text");
      });

      it("should fail when text is only whitespace", async () => {
        const result = await useCase.execute({
          text: "   ",
        });

        expect(result.isFailure).toBe(true);
      });
    });

    describe("provider errors", () => {
      it("should fail when token estimation fails", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.fail("Token estimation service unavailable"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("estimation");
      });
    });

    describe("edge cases", () => {
      it("should handle very short text", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(1),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
        ]);

        const result = await useCase.execute({
          text: "Hi",
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().estimatedTokens).toBe(1);
      });

      it("should handle very long text", async () => {
        const longText = "word ".repeat(10000);
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(12500),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
        ]);

        const result = await useCase.execute({
          text: longText,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().estimatedTokens).toBe(12500);
      });

      it("should handle zero enabled models", async () => {
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(100),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([]);

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("No models available");
      });

      it("should only consider enabled models", async () => {
        const disabledModel: IModelConfig = {
          ...mockExpensiveModel,
          enabled: false,
        };
        vi.mocked(mockLLMProvider.estimateTokens).mockResolvedValue(
          Result.ok(1000),
        );
        vi.mocked(mockModelRouter.getAllModels).mockReturnValue([
          mockOpenAIModel,
          disabledModel,
        ]);

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().estimatedCost.min).toBe(
          result.getValue().estimatedCost.max,
        );
      });
    });
  });
});
