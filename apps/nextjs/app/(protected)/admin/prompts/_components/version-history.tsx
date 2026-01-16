"use client";

import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { History, Loader2, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getManagedPromptAction,
  rollbackManagedPromptAction,
} from "@/adapters/actions/managed-prompts.actions";

type EnvironmentType = "development" | "staging" | "production";

interface VersionHistoryProps {
  promptKey: string;
  environment: EnvironmentType;
  onClose: () => void;
  onRollback: () => void;
}

export function VersionHistory({
  promptKey,
  environment,
  onClose,
  onRollback,
}: VersionHistoryProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<{
    id: string;
    version: number;
    template: string;
    createdAt: string;
  } | null>(null);

  const loadVersionHistory = useCallback(async () => {
    setIsLoading(true);
    const result = await getManagedPromptAction({
      key: promptKey,
      environment,
    });

    if (result.success) {
      setCurrentPrompt({
        id: result.data.id,
        version: result.data.version,
        template: result.data.template,
        createdAt: result.data.createdAt,
      });
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  }, [promptKey, environment]);

  useEffect(() => {
    loadVersionHistory();
  }, [loadVersionHistory]);

  const handleRollback = async (targetVersion: number) => {
    if (!currentPrompt) return;

    setIsRollingBack(true);
    const result = await rollbackManagedPromptAction({
      promptId: currentPrompt.id,
      targetVersion,
    });

    if (result.success) {
      toast.success(
        `Rolled back from v${result.data.rolledBackFrom} to v${result.data.currentVersion}`,
      );
      onRollback();
    } else {
      toast.error(result.error);
    }
    setIsRollingBack(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto border-3 border-black dark:border-white bg-white dark:bg-black m-4">
        <div className="flex items-center justify-between border-b-3 border-black dark:border-white p-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="font-black text-xl uppercase tracking-tight">
              Version History
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
        ) : !currentPrompt ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase">
              No version history available
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="border-3 border-black dark:border-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    Version {currentPrompt.version}
                  </span>
                  <Badge variant="default" className="uppercase text-xs">
                    Current
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(currentPrompt.createdAt).toLocaleString()}
                </span>
              </div>
              <pre className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-3 overflow-x-auto whitespace-pre-wrap">
                {currentPrompt.template}
              </pre>
            </div>

            {currentPrompt.version > 1 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Previous Versions
                </h3>
                {Array.from(
                  { length: currentPrompt.version - 1 },
                  (_, i) => currentPrompt.version - 1 - i,
                ).map((version) => (
                  <div
                    key={version}
                    className="flex items-center justify-between border-3 border-gray-200 dark:border-gray-700 p-3"
                  >
                    <span className="font-bold text-sm">Version {version}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRollback(version)}
                      disabled={isRollingBack}
                      className="border-2 border-black dark:border-white"
                    >
                      {isRollingBack ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3 mr-1" />
                      )}
                      Rollback
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {currentPrompt.version === 1 && (
              <p className="text-sm text-gray-400 text-center py-4">
                This is the first version. No rollback available.
              </p>
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
