import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGenerateText,
  mockStreamText,
  mockOpenai,
  mockAnthropic,
  mockGoogle,
} = vi.hoisted(() => {
  const mockGenerateText = vi.fn();
  const mockStreamText = vi.fn();
  const mockOpenai = vi.fn();
  const mockAnthropic = vi.fn();
  const mockGoogle = vi.fn();

  return {
    mockGenerateText,
    mockStreamText,
    mockOpenai,
    mockAnthropic,
    mockGoogle,
  };
});

vi.mock("ai", () => ({
  generateText: mockGenerateText,
  streamText: mockStreamText,
}));

vi.mock("@ai-sdk/openai", () => ({
  openai: mockOpenai,
}));

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: mockAnthropic,
}));

vi.mock("@ai-sdk/google", () => ({
  google: mockGoogle,
}));

import { AISDKLLMProvider } from "@/adapters/services/llm/ai-sdk-llm.provider";

describe("AISDKLLMProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateText()", () => {
    it("should return Result<IGenerateTextResponse> on success", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockResolvedValue({
        text: "Hello, how can I help you?",
        usage: {
          inputTokens: 10,
          outputTokens: 20,
        },
        finishReason: "stop",
      });

      const result = await provider.generateText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.content).toBe("Hello, how can I help you?");
      expect(response.usage.inputTokens).toBe(10);
      expect(response.usage.outputTokens).toBe(20);
      expect(response.usage.totalTokens).toBe(30);
      expect(response.finishReason).toBe("stop");
    });

    it("should handle Anthropic models", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "claude-3-opus" };
      mockAnthropic.mockReturnValue(mockModel);

      mockGenerateText.mockResolvedValue({
        text: "Response from Claude",
        usage: {
          inputTokens: 15,
          outputTokens: 25,
        },
        finishReason: "end_turn",
      });

      const result = await provider.generateText({
        model: "anthropic/claude-3-opus",
        messages: [{ role: "user", content: "Hello Claude" }],
      });

      expect(result.isSuccess).toBe(true);
      expect(mockAnthropic).toHaveBeenCalledWith("claude-3-opus");
    });

    it("should handle Google models", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gemini-pro" };
      mockGoogle.mockReturnValue(mockModel);

      mockGenerateText.mockResolvedValue({
        text: "Response from Gemini",
        usage: {
          inputTokens: 12,
          outputTokens: 18,
        },
        finishReason: "stop",
      });

      const result = await provider.generateText({
        model: "google/gemini-pro",
        messages: [{ role: "user", content: "Hello Gemini" }],
      });

      expect(result.isSuccess).toBe(true);
      expect(mockGoogle).toHaveBeenCalledWith("gemini-pro");
    });

    it("should pass temperature and maxTokens parameters", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockResolvedValue({
        text: "Response",
        usage: { inputTokens: 5, outputTokens: 10 },
        finishReason: "stop",
      });

      await provider.generateText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
        temperature: 0.7,
        maxTokens: 500,
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
          maxOutputTokens: 500,
        }),
      );
    });

    it("should return error Result when provider throws", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockRejectedValue(new Error("API rate limit exceeded"));

      const result = await provider.generateText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("rate limit");
    });

    it("should return error Result for unsupported provider", async () => {
      const provider = new AISDKLLMProvider();

      const result = await provider.generateText({
        model: "unknown/model",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Unsupported provider");
    });

    it("should handle system messages correctly", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockResolvedValue({
        text: "Response",
        usage: { inputTokens: 20, outputTokens: 10 },
        finishReason: "stop",
      });

      await provider.generateText({
        model: "openai/gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant" },
          { role: "user", content: "Hello" },
        ],
      });

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: "system", content: "You are a helpful assistant" },
            { role: "user", content: "Hello" },
          ],
        }),
      );
    });
  });

  describe("streamText()", () => {
    it("should return Result<IStreamTextResponse> with readable stream", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      const mockTextStream = new ReadableStream({
        start(controller) {
          controller.enqueue("Hello");
          controller.enqueue(" World");
          controller.close();
        },
      });

      mockStreamText.mockResolvedValue({
        textStream: mockTextStream,
        usage: Promise.resolve({
          inputTokens: 5,
          outputTokens: 10,
        }),
      });

      const result = await provider.streamText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isSuccess).toBe(true);
      const response = result.getValue();
      expect(response.stream).toBeInstanceOf(ReadableStream);

      const usage = await response.usage;
      expect(usage.inputTokens).toBe(5);
      expect(usage.outputTokens).toBe(10);
    });

    it("should return error Result when streaming fails", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockStreamText.mockRejectedValue(new Error("Connection timeout"));

      const result = await provider.streamText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("timeout");
    });

    it("should handle stream cancellation gracefully", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      const mockTextStream = new ReadableStream({
        start(controller) {
          controller.enqueue("Hello");
        },
        cancel() {},
      });

      mockStreamText.mockResolvedValue({
        textStream: mockTextStream,
        usage: Promise.resolve({
          inputTokens: 5,
          outputTokens: 3,
        }),
      });

      const result = await provider.streamText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isSuccess).toBe(true);

      const reader = result.getValue().stream.getReader();
      await reader.cancel();
    });
  });

  describe("estimateTokens()", () => {
    it("should return Result<number> with estimated token count", async () => {
      const provider = new AISDKLLMProvider();

      const result = await provider.estimateTokens("Hello, how are you today?");

      expect(result.isSuccess).toBe(true);
      const tokenCount = result.getValue();
      expect(tokenCount).toBeGreaterThan(0);
      expect(typeof tokenCount).toBe("number");
    });

    it("should estimate more tokens for longer text", async () => {
      const provider = new AISDKLLMProvider();

      const shortResult = await provider.estimateTokens("Hello");
      const longResult = await provider.estimateTokens(
        "Hello, this is a much longer piece of text that should have more tokens",
      );

      expect(shortResult.isSuccess).toBe(true);
      expect(longResult.isSuccess).toBe(true);
      expect(longResult.getValue()).toBeGreaterThan(shortResult.getValue());
    });

    it("should return zero for empty string", async () => {
      const provider = new AISDKLLMProvider();

      const result = await provider.estimateTokens("");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(0);
    });
  });

  describe("getAvailableModels()", () => {
    it("should return array of IModelConfig", () => {
      const provider = new AISDKLLMProvider();

      const models = provider.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);

      const firstModel = models[0];
      expect(firstModel).toHaveProperty("provider");
      expect(firstModel).toHaveProperty("model");
      expect(firstModel).toHaveProperty("costPer1kIn");
      expect(firstModel).toHaveProperty("costPer1kOut");
      expect(firstModel).toHaveProperty("capabilities");
      expect(firstModel).toHaveProperty("maxTokens");
      expect(firstModel).toHaveProperty("enabled");
    });

    it("should include models from multiple providers", () => {
      const provider = new AISDKLLMProvider();

      const models = provider.getAvailableModels();
      const providers = [...new Set(models.map((m) => m.provider))];

      expect(providers).toContain("openai");
      expect(providers).toContain("anthropic");
    });

    it("should have valid cost values", () => {
      const provider = new AISDKLLMProvider();

      const models = provider.getAvailableModels();

      for (const model of models) {
        expect(model.costPer1kIn).toBeGreaterThanOrEqual(0);
        expect(model.costPer1kOut).toBeGreaterThanOrEqual(0);
      }
    });

    it("should have capabilities array for each model", () => {
      const provider = new AISDKLLMProvider();

      const models = provider.getAvailableModels();

      for (const model of models) {
        expect(Array.isArray(model.capabilities)).toBe(true);
      }
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockRejectedValue(new Error("Network error"));

      const result = await provider.generateText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isFailure).toBe(true);
    });

    it("should handle invalid API key errors", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockRejectedValue(new Error("Invalid API key"));

      const result = await provider.generateText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Hello" }],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Invalid API key");
    });

    it("should handle context length exceeded errors", async () => {
      const provider = new AISDKLLMProvider();
      const mockModel = { modelId: "gpt-4" };
      mockOpenai.mockReturnValue(mockModel);

      mockGenerateText.mockRejectedValue(
        new Error("Context length exceeded: maximum is 8192 tokens"),
      );

      const result = await provider.generateText({
        model: "openai/gpt-4",
        messages: [{ role: "user", content: "Very long message..." }],
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Context length exceeded");
    });
  });
});
