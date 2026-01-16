"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { cn } from "@packages/ui/index";
import { Edit, History, Loader2, Play, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { listManagedPromptsAction } from "@/adapters/actions/managed-prompts.actions";
import type { IManagedPromptSummaryDto } from "@/application/dto/llm/list-managed-prompts.dto";
import { PromptEditor } from "./prompt-editor";
import { PromptPlayground } from "./prompt-playground";
import { VersionHistory } from "./version-history";

type EnvironmentType = "development" | "staging" | "production";

export function ManagedPromptsTable() {
  const [prompts, setPrompts] = useState<IManagedPromptSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<EnvironmentType>("development");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] =
    useState<IManagedPromptSummaryDto | null>(null);
  const [historyPrompt, setHistoryPrompt] =
    useState<IManagedPromptSummaryDto | null>(null);
  const [playgroundPrompt, setPlaygroundPrompt] =
    useState<IManagedPromptSummaryDto | null>(null);

  const loadPrompts = useCallback(async () => {
    setIsLoading(true);
    const result = await listManagedPromptsAction({
      environment: selectedEnvironment,
      search: searchQuery || undefined,
      pagination: { page: 1, limit: 50 },
    });

    if (result.success) {
      setPrompts(result.data.prompts);
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [selectedEnvironment, searchQuery]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const handleCreateNew = () => {
    setEditingPrompt(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (prompt: IManagedPromptSummaryDto) => {
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  };

  const handleViewHistory = (prompt: IManagedPromptSummaryDto) => {
    setHistoryPrompt(prompt);
  };

  const handleOpenPlayground = (prompt: IManagedPromptSummaryDto) => {
    setPlaygroundPrompt(prompt);
  };

  const handlePlaygroundClose = () => {
    setPlaygroundPrompt(null);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setEditingPrompt(null);
  };

  const handleEditorSave = () => {
    handleEditorClose();
    loadPrompts();
  };

  const handleHistoryClose = () => {
    setHistoryPrompt(null);
  };

  const handleRollback = () => {
    handleHistoryClose();
    loadPrompts();
  };

  const environments: EnvironmentType[] = [
    "development",
    "staging",
    "production",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex border-3 border-black dark:border-white">
          {environments.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => setSelectedEnvironment(env)}
              className={cn(
                "px-4 py-2 font-bold uppercase text-xs tracking-wide transition-colors",
                selectedEnvironment === env
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white text-black dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900",
                env !== "development" &&
                  "border-l-3 border-black dark:border-white",
              )}
            >
              {env}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search prompts..."
          className="flex-1 min-w-[200px] border-3 border-black dark:border-white bg-white dark:bg-black px-3 py-2 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
        />
        <Button
          onClick={loadPrompts}
          variant="outline"
          size="sm"
          className="border-3 border-black dark:border-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleCreateNew}
          className="border-3 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Prompt
        </Button>
      </div>

      <div className="border-3 border-black dark:border-white">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-0 border-b-3 border-black dark:border-white bg-gray-100 dark:bg-gray-900">
          <div className="px-4 py-3 font-bold uppercase text-xs tracking-wide">
            Key
          </div>
          <div className="px-4 py-3 font-bold uppercase text-xs tracking-wide border-l-3 border-black dark:border-white">
            Name
          </div>
          <div className="px-4 py-3 font-bold uppercase text-xs tracking-wide border-l-3 border-black dark:border-white text-center">
            Version
          </div>
          <div className="px-4 py-3 font-bold uppercase text-xs tracking-wide border-l-3 border-black dark:border-white text-center">
            Status
          </div>
          <div className="px-4 py-3 font-bold uppercase text-xs tracking-wide border-l-3 border-black dark:border-white text-center">
            Updated
          </div>
          <div className="px-4 py-3 font-bold uppercase text-xs tracking-wide border-l-3 border-black dark:border-white text-center">
            Actions
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase">
              No prompts found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Create your first managed prompt
            </p>
          </div>
        ) : (
          prompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className={cn(
                "grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-0",
                index !== prompts.length - 1 &&
                  "border-b-3 border-black dark:border-white",
              )}
            >
              <div className="px-4 py-3 font-mono text-sm truncate">
                {prompt.key}
              </div>
              <div className="px-4 py-3 text-sm truncate border-l-3 border-black dark:border-white">
                {prompt.name}
              </div>
              <div className="px-4 py-3 text-sm text-center border-l-3 border-black dark:border-white">
                v{prompt.version}
              </div>
              <div className="px-4 py-3 border-l-3 border-black dark:border-white flex items-center justify-center">
                <Badge
                  variant={prompt.isActive ? "default" : "secondary"}
                  className="uppercase text-xs"
                >
                  {prompt.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center border-l-3 border-black dark:border-white">
                {prompt.updatedAt
                  ? new Date(prompt.updatedAt).toLocaleDateString()
                  : "-"}
              </div>
              <div className="px-4 py-3 border-l-3 border-black dark:border-white flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenPlayground(prompt)}
                  className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900 transition-colors text-green-600 dark:text-green-400"
                  title="Test in Playground"
                >
                  <Play className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(prompt)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleViewHistory(prompt)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                  title="Version History"
                >
                  <History className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isEditorOpen && (
        <PromptEditor
          prompt={editingPrompt}
          environment={selectedEnvironment}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      )}

      {historyPrompt && (
        <VersionHistory
          promptKey={historyPrompt.key}
          environment={selectedEnvironment}
          onClose={handleHistoryClose}
          onRollback={handleRollback}
        />
      )}

      {playgroundPrompt && (
        <PromptPlayground
          promptKey={playgroundPrompt.key}
          environment={selectedEnvironment}
          onClose={handlePlaygroundClose}
        />
      )}
    </div>
  );
}
