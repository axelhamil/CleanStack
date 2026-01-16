"use client";

import { Button } from "@packages/ui/components/ui/button";
import { Input } from "@packages/ui/components/ui/input";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createManagedPromptAction,
  getManagedPromptAction,
  updateManagedPromptAction,
} from "@/adapters/actions/managed-prompts.actions";
import type { IPromptVariable } from "@/application/dto/llm/common.dto";
import type { IManagedPromptSummaryDto } from "@/application/dto/llm/list-managed-prompts.dto";

type EnvironmentType = "development" | "staging" | "production";
type VariableType = "string" | "number" | "boolean";

interface PromptEditorProps {
  prompt: IManagedPromptSummaryDto | null;
  environment: EnvironmentType;
  onClose: () => void;
  onSave: () => void;
}

export function PromptEditor({
  prompt,
  environment,
  onClose,
  onSave,
}: PromptEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("");
  const [variables, setVariables] = useState<IPromptVariable[]>([]);

  const loadPromptDetails = useCallback(async () => {
    if (!prompt) return;

    setIsLoading(true);
    const result = await getManagedPromptAction({
      key: prompt.key,
      environment,
    });

    if (result.success) {
      const data = result.data;
      setKey(data.key);
      setName(data.name);
      setDescription(data.description ?? "");
      setTemplate(data.template);
      setVariables(data.variables);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [prompt, environment]);

  useEffect(() => {
    if (prompt) {
      loadPromptDetails();
    }
  }, [prompt, loadPromptDetails]);

  const handleAddVariable = () => {
    setVariables((prev) => [
      ...prev,
      { name: "", type: "string" as VariableType, required: true },
    ]);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariableChange = (
    index: number,
    field: keyof IPromptVariable,
    value: string | boolean,
  ) => {
    setVariables((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!key.trim() || !name.trim() || !template.trim()) {
      toast.error("Key, name, and template are required");
      return;
    }

    setIsSaving(true);

    const validVariables = variables.filter((v) => v.name.trim());

    if (prompt) {
      const result = await updateManagedPromptAction({
        key,
        environment,
        name,
        description: description || undefined,
        template,
        variables: validVariables.length > 0 ? validVariables : undefined,
      });

      if (result.success) {
        toast.success("Prompt updated successfully");
        onSave();
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await createManagedPromptAction({
        key,
        name,
        description: description || undefined,
        template,
        variables: validVariables.length > 0 ? validVariables : undefined,
        environment,
      });

      if (result.success) {
        toast.success("Prompt created successfully");
        onSave();
      } else {
        toast.error(result.error);
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-3 border-black dark:border-white bg-white dark:bg-black m-4">
        <div className="flex items-center justify-between border-b-3 border-black dark:border-white p-4">
          <h2 className="font-black text-xl uppercase tracking-tight">
            {prompt ? "Edit Prompt" : "New Prompt"}
          </h2>
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
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="prompt-key"
                  className="text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Key
                </label>
                <Input
                  id="prompt-key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="welcome-message"
                  disabled={!!prompt}
                  className="border-3 border-black dark:border-white"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="prompt-name"
                  className="text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Name
                </label>
                <Input
                  id="prompt-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Welcome Message"
                  className="border-3 border-black dark:border-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="prompt-description"
                className="text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Description
              </label>
              <Input
                id="prompt-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this prompt"
                className="border-3 border-black dark:border-white"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="prompt-template"
                className="text-xs font-bold uppercase tracking-wide text-gray-500"
              >
                Template
              </label>
              <textarea
                id="prompt-template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Hello {{name}}, welcome to our platform..."
                rows={6}
                className="w-full resize-none border-3 border-black dark:border-white bg-white dark:bg-black p-3 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
              />
              <p className="text-xs text-gray-400">
                Use {"{{variableName}}"} for template variables
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Variables
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddVariable}
                  className="border-2 border-black dark:border-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              {variables.length > 0 ? (
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <div
                      key={`var-${index}-${variable.name || "new"}`}
                      className="flex items-center gap-2 border-3 border-black dark:border-white p-2"
                    >
                      <Input
                        value={variable.name}
                        onChange={(e) =>
                          handleVariableChange(index, "name", e.target.value)
                        }
                        placeholder="Variable name"
                        className="flex-1 border-2 border-gray-300 dark:border-gray-700"
                      />
                      <select
                        value={variable.type}
                        onChange={(e) =>
                          handleVariableChange(index, "type", e.target.value)
                        }
                        className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-1.5 text-sm"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) =>
                            handleVariableChange(
                              index,
                              "required",
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4"
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(index)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-2">
                  No variables defined
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-3 border-black dark:border-white">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-3 border-black dark:border-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="border-3 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : prompt ? (
                  "Update Prompt"
                ) : (
                  "Create Prompt"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
