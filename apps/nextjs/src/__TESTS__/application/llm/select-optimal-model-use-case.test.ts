import { Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ISelectOptimalModelInputDto } from "@/application/dto/llm/select-optimal-model.dto";
import type { IModelConfig } from "@/application/ports/llm.provider.port";
import type {
  IModelRouter,
  ISelectedModel,
} from "@/application/ports/model-router.port";
import { SelectOptimalModelUseCase } from "@/application/use-cases/llm/select-optimal-model.use-case";

describe("SelectOptimalModelUseCase", () => {
  let useCase: SelectOptimalModelUseCase;
  let mockModelRouter: IModelRouter;

  const validInput: ISelectOptimalModelInputDto = {
    capabilities: ["text"],
    strategy: "cheapest",
  };

  const mockSelectedModel: ISelectedModel = {
    provider: "openai",
    model: "gpt-4o-mini",
    estimatedCostPer1kTokens: {
      input: 0.00015,
      output: 0.0006,
    },
  };

  const _mockModelConfig: IModelConfig = {
    provider: "openai",
    model: "gpt-4o-mini",
    costPer1kIn: 0.00015,
    costPer1kOut: 0.0006,
    capabilities: ["text", "json"],
    maxTokens: 128000,
    enabled: true,
  };

  const _mockAnthropicModel: IModelConfig = {
    provider: "anthropic",
    model: "claude-3-haiku",
    costPer1kIn: 0.00025,
    costPer1kOut: 0.00125,
    capabilities: ["text", "json", "vision"],
    maxTokens: 200000,
    enabled: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockModelRouter = {
      selectOptimalModel: vi.fn(),
      getModelConfig: vi.fn(),
      getAllModels: vi.fn(),
    };

    useCase = new SelectOptimalModelUseCase(mockModelRouter);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return selected model when model router succeeds", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
          provider: mockSelectedModel.provider,
          model: mockSelectedModel.model,
          estimatedCostPer1kTokens: mockSelectedModel.estimatedCostPer1kTokens,
        });
      });

      it("should pass capabilities to model router", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text", "vision"],
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            capabilities: ["text", "vision"],
          }),
        );
      });

      it("should use cheapest strategy by default", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            strategy: "cheapest",
          }),
        );
      });

      it("should pass custom strategy when provided", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
          strategy: "fastest",
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            strategy: "fastest",
          }),
        );
      });
    });

    describe("budget constraints", () => {
      it("should pass maxBudget to model router when provided", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
          maxBudget: 0.01,
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            maxBudget: 0.01,
          }),
        );
      });

      it("should respect budget and return cheaper model", async () => {
        const cheaperModel: ISelectedModel = {
          provider: "openai",
          model: "gpt-3.5-turbo",
          estimatedCostPer1kTokens: {
            input: 0.0005,
            output: 0.0015,
          },
        };
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(cheaperModel),
        );

        const result = await useCase.execute({
          capabilities: ["text"],
          maxBudget: 0.001,
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().model).toBe("gpt-3.5-turbo");
      });
    });

    describe("provider preferences", () => {
      it("should pass preferredProviders to model router", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
          preferredProviders: ["anthropic", "openai"],
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            preferredProviders: ["anthropic", "openai"],
          }),
        );
      });

      it("should prioritize preferred provider", async () => {
        const anthropicModel: ISelectedModel = {
          provider: "anthropic",
          model: "claude-3-haiku",
          estimatedCostPer1kTokens: {
            input: 0.00025,
            output: 0.00125,
          },
        };
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(anthropicModel),
        );

        const result = await useCase.execute({
          capabilities: ["text"],
          preferredProviders: ["anthropic"],
        });

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().provider).toBe("anthropic");
      });
    });

    describe("strategy selection", () => {
      it("should support cheapest strategy", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
          strategy: "cheapest",
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            strategy: "cheapest",
          }),
        );
      });

      it("should support fastest strategy", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
          strategy: "fastest",
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            strategy: "fastest",
          }),
        );
      });

      it("should support round-robin strategy", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(mockSelectedModel),
        );

        await useCase.execute({
          capabilities: ["text"],
          strategy: "round-robin",
        });

        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            strategy: "round-robin",
          }),
        );
      });
    });

    describe("error handling", () => {
      it("should return error when no capable model is available", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.fail("No model available with required capabilities"),
        );

        const result = await useCase.execute({
          capabilities: ["vision"],
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("No model available");
      });

      it("should return error when all models exceed budget", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.fail("All available models exceed the specified budget"),
        );

        const result = await useCase.execute({
          capabilities: ["text"],
          maxBudget: 0.000001,
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("budget");
      });

      it("should return error when no models match preferred providers", async () => {
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.fail("No enabled models found for preferred providers"),
        );

        const result = await useCase.execute({
          capabilities: ["text"],
          preferredProviders: ["nonexistent-provider"],
        });

        expect(result.isFailure).toBe(true);
      });
    });

    describe("validation errors", () => {
      it("should fail when capabilities array is empty", async () => {
        const result = await useCase.execute({
          capabilities: [],
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("capabilities");
      });
    });

    describe("multiple capabilities", () => {
      it("should select model that supports all required capabilities", async () => {
        const visionModel: ISelectedModel = {
          provider: "anthropic",
          model: "claude-3-sonnet",
          estimatedCostPer1kTokens: {
            input: 0.003,
            output: 0.015,
          },
        };
        vi.mocked(mockModelRouter.selectOptimalModel).mockReturnValue(
          Result.ok(visionModel),
        );

        const result = await useCase.execute({
          capabilities: ["text", "vision", "json"],
        });

        expect(result.isSuccess).toBe(true);
        expect(mockModelRouter.selectOptimalModel).toHaveBeenCalledWith(
          expect.objectContaining({
            capabilities: ["text", "vision", "json"],
          }),
        );
      });
    });
  });
});
