"use client";

import { Button } from "@packages/ui/components/ui/button";
import { cn } from "@packages/ui/index";
import { Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onStop,
  isStreaming = false,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming && !disabled) {
        onSend(input.trim());
        setInput("");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t-3 border-black dark:border-white p-4"
    >
      <div className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isStreaming || disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none border-3 border-black dark:border-white bg-white dark:bg-black p-3 text-sm font-medium",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-0 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]",
            "disabled:opacity-50",
          )}
        />
        {isStreaming ? (
          <Button
            type="button"
            onClick={onStop}
            variant="destructive"
            className="shrink-0 border-3 border-black dark:border-white"
          >
            <Square className="h-4 w-4 mr-2" fill="currentColor" />
            Stop
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={!input.trim() || disabled}
            className="shrink-0 border-3 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
