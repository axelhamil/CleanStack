import type { Result } from "@packages/ddd-kit";

export interface ILLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface IGenerateTextParams {
  model: string;
  messages: ILLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface IGenerateTextResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export interface IStreamTextParams {
  model: string;
  messages: ILLMMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface IStreamTextResponse {
  stream: ReadableStream<string>;
  usage: Promise<{ inputTokens: number; outputTokens: number }>;
}

export interface IModelConfig {
  provider: string;
  model: string;
  costPer1kIn: number;
  costPer1kOut: number;
  capabilities: string[];
  maxTokens: number;
  enabled: boolean;
}

export interface ILLMProvider {
  generateText(
    params: IGenerateTextParams,
  ): Promise<Result<IGenerateTextResponse>>;
  streamText(params: IStreamTextParams): Promise<Result<IStreamTextResponse>>;
  estimateTokens(text: string): Promise<Result<number>>;
  getAvailableModels(): IModelConfig[];
}
