"use client";

import { cn } from "@packages/ui/index";
import { Bot, Loader2, User } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 border-3",
        isUser
          ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          : "bg-white dark:bg-black border-black dark:border-white",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center border-2",
          isUser
            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
            : "bg-white text-black dark:bg-black dark:text-white border-black dark:border-white",
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" strokeWidth={2.5} />
        ) : (
          <Bot className="h-4 w-4" strokeWidth={2.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
          {isUser ? "You" : "Assistant"}
        </p>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {message.content || (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              {isStreaming ? "Thinking..." : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
