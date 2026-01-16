import { beforeEach, describe, expect, it } from "vitest";
import { ModelRouterService } from "@/adapters/services/llm/model-router.service";
import type { IModelConfig } from "@/application/ports/llm.provider.port";

const mockModels: IModelConfig[] = [
  {
    provider: "openai",
    model: "gpt-4",
    costPer1kIn: 0.03,
    costPer1kOut: 0.06,
    capabilities: ["chat", "function-calling"],
    maxTokens: 8192,
    enabled: true,
  },
  {
    provider: "openai",
    model: "gpt-3.5-turbo",
    costPer1kIn: 0.0005,
    costPer1kOut: 0.0015,
    capabilities: ["chat", "function-calling"],
    maxTokens: 16385,
    enabled: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-opus",
    costPer1kIn: 0.015,
    costPer1kOut: 0.075,
    capabilities: ["chat", "vision"],
    maxTokens: 200000,
    enabled: true,
  },
  {
    provider: "anthropic",
    model: "claude-3-sonnet",
    costPer1kIn: 0.003,
    costPer1kOut: 0.015,
    capabilities: ["chat", "vision"],
    maxTokens: 200000,
    enabled: true,
  },
  {
    provider: "google",
    model: "gemini-pro",
    costPer1kIn: 0.00025,
    costPer1kOut: 0.0005,
    capabilities: ["chat"],
    maxTokens: 30720,
    enabled: true,
  },
  {
    provider: "openai",
    model: "gpt-4-vision",
    costPer1kIn: 0.01,
    costPer1kOut: 0.03,
    capabilities: ["chat", "vision"],
    maxTokens: 128000,
    enabled: false,
  },
];

describe("ModelRouterService", () => {
  let router: ModelRouterService;

  beforeEach(() => {
    router = new ModelRouterService(mockModels);
  });

  describe("selectOptimalModel()", () => {
    describe("with 'cheapest' strategy", () => {
      it("should return Result<ISelectedModel> with cheapest model for given capabilities", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "cheapest",
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.provider).toBe("google");
        expect(selected.model).toBe("gemini-pro");
        expect(selected.estimatedCostPer1kTokens.input).toBe(0.00025);
        expect(selected.estimatedCostPer1kTokens.output).toBe(0.0005);
      });

      it("should select cheapest model with vision capability", () => {
        const result = router.selectOptimalModel({
          capabilities: ["vision"],
          strategy: "cheapest",
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.provider).toBe("anthropic");
        expect(selected.model).toBe("claude-3-sonnet");
      });

      it("should select cheapest model with multiple capabilities", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat", "function-calling"],
          strategy: "cheapest",
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.provider).toBe("openai");
        expect(selected.model).toBe("gpt-3.5-turbo");
      });
    });

    describe("with 'fastest' strategy", () => {
      it("should return model with smallest maxTokens (assumed faster)", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "fastest",
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.provider).toBe("openai");
        expect(selected.model).toBe("gpt-4");
      });
    });

    describe("with 'round-robin' strategy", () => {
      it("should cycle through available models", () => {
        const first = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "round-robin",
        });
        const second = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "round-robin",
        });

        expect(first.isSuccess).toBe(true);
        expect(second.isSuccess).toBe(true);
        expect(first.getValue().model).not.toBe(second.getValue().model);
      });

      it("should wrap around after cycling through all models", () => {
        const results: string[] = [];
        for (let i = 0; i < 6; i++) {
          const result = router.selectOptimalModel({
            capabilities: ["chat"],
            strategy: "round-robin",
          });
          if (result.isSuccess) {
            results.push(result.getValue().model);
          }
        }

        expect(results[0]).toBe(results[5]);
      });
    });

    describe("capability filtering", () => {
      it("should only return models that have all required capabilities", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat", "vision", "function-calling"],
          strategy: "cheapest",
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("No models available");
      });

      it("should fail when no models match capabilities", () => {
        const result = router.selectOptimalModel({
          capabilities: ["nonexistent-capability"],
          strategy: "cheapest",
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("No models available");
      });
    });

    describe("availability filtering", () => {
      it("should not select disabled models", () => {
        const result = router.selectOptimalModel({
          capabilities: ["vision"],
          strategy: "cheapest",
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.model).not.toBe("gpt-4-vision");
      });
    });

    describe("budget constraints", () => {
      it("should filter models exceeding maxBudget for input cost", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "cheapest",
          maxBudget: 0.001,
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.estimatedCostPer1kTokens.input).toBeLessThanOrEqual(
          0.001,
        );
      });

      it("should fail when all models exceed budget", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "cheapest",
          maxBudget: 0.0001,
        });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("budget");
      });
    });

    describe("preferred providers", () => {
      it("should prioritize models from preferred providers", () => {
        const result = router.selectOptimalModel({
          capabilities: ["chat"],
          strategy: "cheapest",
          preferredProviders: ["anthropic"],
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.provider).toBe("anthropic");
      });

      it("should fall back to non-preferred providers if no match", () => {
        const result = router.selectOptimalModel({
          capabilities: ["function-calling"],
          strategy: "cheapest",
          preferredProviders: ["anthropic"],
        });

        expect(result.isSuccess).toBe(true);
        const selected = result.getValue();
        expect(selected.provider).toBe("openai");
      });
    });
  });

  describe("getModelConfig()", () => {
    it("should return Option<IModelConfig> with Some when model exists", () => {
      const result = router.getModelConfig("openai", "gpt-4");

      expect(result.isSome()).toBe(true);
      const config = result.unwrap();
      expect(config.provider).toBe("openai");
      expect(config.model).toBe("gpt-4");
      expect(config.costPer1kIn).toBe(0.03);
    });

    it("should return Option<IModelConfig> with None when model not found", () => {
      const result = router.getModelConfig("openai", "nonexistent-model");

      expect(result.isNone()).toBe(true);
    });

    it("should return None when provider not found", () => {
      const result = router.getModelConfig("unknown-provider", "gpt-4");

      expect(result.isNone()).toBe(true);
    });

    it("should return disabled models", () => {
      const result = router.getModelConfig("openai", "gpt-4-vision");

      expect(result.isSome()).toBe(true);
      const config = result.unwrap();
      expect(config.enabled).toBe(false);
    });
  });

  describe("getAllModels()", () => {
    it("should return array of all IModelConfig", () => {
      const models = router.getAllModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBe(6);
    });

    it("should include both enabled and disabled models", () => {
      const models = router.getAllModels();
      const disabled = models.filter((m) => !m.enabled);
      const enabled = models.filter((m) => m.enabled);

      expect(disabled.length).toBe(1);
      expect(enabled.length).toBe(5);
    });

    it("should return a copy of models (not mutate internal state)", () => {
      const models1 = router.getAllModels();
      const firstModel = models1[0];
      if (firstModel) {
        firstModel.costPer1kIn = 999;
      }

      const models2 = router.getAllModels();
      const secondModel = models2[0];
      expect(secondModel?.costPer1kIn).not.toBe(999);
    });
  });

  describe("edge cases", () => {
    it("should handle empty models array", () => {
      const emptyRouter = new ModelRouterService([]);
      const result = emptyRouter.selectOptimalModel({
        capabilities: ["chat"],
        strategy: "cheapest",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("No models available");
    });

    it("should handle empty capabilities array", () => {
      const result = router.selectOptimalModel({
        capabilities: [],
        strategy: "cheapest",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should handle all models being disabled", () => {
      const allDisabled: IModelConfig[] = mockModels.map((m) => ({
        ...m,
        enabled: false,
      }));
      const disabledRouter = new ModelRouterService(allDisabled);

      const result = disabledRouter.selectOptimalModel({
        capabilities: ["chat"],
        strategy: "cheapest",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("No models available");
    });
  });
});
