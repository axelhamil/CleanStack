import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { Result } from "@packages/ddd-kit";
import { generateText, streamText } from "ai";
import type {
  IGenerateTextParams,
  IGenerateTextResponse,
  ILLMProvider,
  IModelConfig,
  IStreamTextParams,
  IStreamTextResponse,
} from "@/application/ports/llm.provider.port";

const AVAILABLE_MODELS: IModelConfig[] = [
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
    model: "gpt-4-turbo",
    costPer1kIn: 0.01,
    costPer1kOut: 0.03,
    capabilities: ["chat", "function-calling", "vision"],
    maxTokens: 128000,
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
];

export class AISDKLLMProvider implements ILLMProvider {
  async generateText(
    params: IGenerateTextParams,
  ): Promise<Result<IGenerateTextResponse>> {
    try {
      const modelResult = this.getModel(params.model);
      if (modelResult.isFailure) {
        return Result.fail(modelResult.getError());
      }

      const result = await generateText({
        model: modelResult.getValue(),
        messages: params.messages,
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
      });

      const inputTokens = result.usage.inputTokens ?? 0;
      const outputTokens = result.usage.outputTokens ?? 0;

      return Result.ok({
        content: result.text,
        usage: {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
        },
        model: params.model,
        finishReason: result.finishReason,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return Result.fail(message);
    }
  }

  async streamText(
    params: IStreamTextParams,
  ): Promise<Result<IStreamTextResponse>> {
    try {
      const modelResult = this.getModel(params.model);
      if (modelResult.isFailure) {
        return Result.fail(modelResult.getError());
      }

      const result = await streamText({
        model: modelResult.getValue(),
        messages: params.messages,
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
      });

      const usagePromise = Promise.resolve(result.usage).then((usage) => ({
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
      }));

      return Result.ok({
        stream: result.textStream as ReadableStream<string>,
        usage: usagePromise,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return Result.fail(message);
    }
  }

  async estimateTokens(text: string): Promise<Result<number>> {
    if (text === "") {
      return Result.ok(0);
    }
    const estimatedTokens = Math.ceil(text.length / 4);
    return Result.ok(estimatedTokens);
  }

  getAvailableModels(): IModelConfig[] {
    return AVAILABLE_MODELS;
  }

  private getModel(modelString: string): Result<ReturnType<typeof openai>> {
    const [provider, ...modelParts] = modelString.split("/");
    const modelName = modelParts.join("/");

    switch (provider) {
      case "openai":
        return Result.ok(openai(modelName));
      case "anthropic":
        return Result.ok(anthropic(modelName) as ReturnType<typeof openai>);
      case "google":
        return Result.ok(google(modelName) as ReturnType<typeof openai>);
      default:
        return Result.fail(`Unsupported provider: ${provider}`);
    }
  }
}
