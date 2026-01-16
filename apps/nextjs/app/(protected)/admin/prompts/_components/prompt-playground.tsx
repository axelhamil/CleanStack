"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { DollarSign, Loader2, Play, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { estimateCostAction } from "@/adapters/actions/llm.actions";
import {
  getManagedPromptAction,
  testManagedPromptAction,
} from "@/adapters/actions/managed-prompts.actions";
import type { IGetManagedPromptOutputDto } from "@/application/dto/llm/get-managed-prompt.dto";

type EnvironmentType = "development" | "staging" | "production";

interface PromptPlaygroundProps {
  promptKey: string;
  environment: EnvironmentType;
  onClose: () => void;
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "google", label: "Google" },
];

const MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku" },
    { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
  ],
  google: [
    { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  ],
};

export function PromptPlayground({
  promptKey,
  environment,
  onClose,
}: PromptPlaygroundProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [prompt, setPrompt] = useState<IGetManagedPromptOutputDto | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [renderedPrompt, setRenderedPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [executionResult, setExecutionResult] = useState<{
    model: string;
    provider: string;
    usage: { inputTokens: number; outputTokens: number; totalTokens: number };
    cost: { amount: number; currency: string };
  } | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<{
    min: number;
    max: number;
    currency: string;
    tokens: number;
  } | null>(null);

  const loadPrompt = useCallback(async () => {
    setIsLoading(true);
    const result = await getManagedPromptAction({
      key: promptKey,
      environment,
    });

    if (result.success) {
      setPrompt(result.data);
      const initialVariables: Record<string, string> = {};
      for (const variable of result.data.variables) {
        initialVariables[variable.name] = variable.defaultValue ?? "";
      }
      setVariables(initialVariables);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [promptKey, environment]);

  useEffect(() => {
    loadPrompt();
  }, [loadPrompt]);

  const renderTemplate = useCallback(() => {
    if (!prompt) return "";
    let rendered = prompt.template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
    }
    return rendered;
  }, [prompt, variables]);

  useEffect(() => {
    const rendered = renderTemplate();
    setRenderedPrompt(rendered);

    if (rendered) {
      estimateCostAction({ text: rendered, model: selectedModel }).then(
        (result) => {
          if (result.success) {
            setEstimatedCost({
              min: result.data.estimatedCost.min,
              max: result.data.estimatedCost.max,
              currency: result.data.estimatedCost.currency,
              tokens: result.data.estimatedTokens,
            });
          }
        },
      );
    }
  }, [renderTemplate, selectedModel]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    const models = MODELS[provider];
    const firstModel = models?.[0];
    if (firstModel) {
      setSelectedModel(firstModel.value);
    }
  };

  const handleExecute = async () => {
    if (!prompt) return;

    setIsExecuting(true);
    setResponse("");
    setExecutionResult(null);

    const result = await testManagedPromptAction({
      promptId: prompt.id,
      variables,
      provider: selectedProvider,
      model: selectedModel,
    });

    if (result.success) {
      setResponse(result.data.response);
      setRenderedPrompt(result.data.renderedPrompt);
      setExecutionResult({
        model: result.data.model,
        provider: result.data.provider,
        usage: result.data.usage,
        cost: result.data.cost,
      });
    } else {
      toast.error(result.error);
    }

    setIsExecuting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-3 border-black dark:border-white bg-white dark:bg-black m-4">
        <div className="flex items-center justify-between border-b-3 border-black dark:border-white p-4">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            <h2 className="font-black text-xl uppercase tracking-tight">
              Prompt Playground
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : !prompt ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase">
              Failed to load prompt
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="playground-provider"
                  className="text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Provider
                </label>
                <select
                  id="playground-provider"
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full border-3 border-black dark:border-white bg-white dark:bg-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                >
                  {PROVIDERS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="playground-model"
                  className="text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Model
                </label>
                <select
                  id="playground-model"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border-3 border-black dark:border-white bg-white dark:bg-black px-3 py-2 text-sm font-medium focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                >
                  {MODELS[selectedProvider]?.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {prompt.variables.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Variables
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {prompt.variables.map((variable) => (
                    <div key={variable.name} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {variable.name}
                        </span>
                        {variable.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Input
                        value={variables[variable.name] ?? ""}
                        onChange={(e) =>
                          setVariables((prev) => ({
                            ...prev,
                            [variable.name]: e.target.value,
                          }))
                        }
                        placeholder={`Enter ${variable.name}`}
                        className="border-3 border-black dark:border-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Rendered Prompt
                </span>
                {estimatedCost && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <DollarSign className="h-3 w-3" />
                    <span>~{estimatedCost.tokens} tokens</span>
                    <span>
                      ${estimatedCost.min.toFixed(4)} - $
                      {estimatedCost.max.toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
              <pre className="text-sm font-mono bg-gray-50 dark:bg-gray-900 p-4 border-3 border-black dark:border-white overflow-x-auto whitespace-pre-wrap min-h-[100px]">
                {renderedPrompt || "Enter variables to preview the prompt"}
              </pre>
            </div>

            <Button
              onClick={handleExecute}
              disabled={isExecuting || !renderedPrompt}
              className="w-full border-3 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute Prompt
                </>
              )}
            </Button>

            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Response
                  </span>
                  {executionResult && (
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        {executionResult.provider}/{executionResult.model}
                      </span>
                      <span>{executionResult.usage.totalTokens} tokens</span>
                      <span className="font-bold">
                        ${executionResult.cost.amount.toFixed(4)}{" "}
                        {executionResult.cost.currency}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-green-50 dark:bg-green-950 border-3 border-green-500 p-4">
                  <pre className="text-sm whitespace-pre-wrap">{response}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t-3 border-black dark:border-white p-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-3 border-black dark:border-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
