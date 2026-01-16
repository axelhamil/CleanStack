"use client";

import { Button } from "@packages/ui/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import type { Message } from "./message-bubble";
import { MessageList } from "./message-list";

interface ChatInterfaceProps {
  conversationId?: string;
  initialMessages?: Message[];
  systemPrompt?: string;
  onConversationStart?: (conversationId: string) => void;
}

type StreamingStatus = "idle" | "streaming" | "error";

export function ChatInterface({
  conversationId,
  initialMessages = [],
  systemPrompt,
  onConversationStart,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState<StreamingStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >(conversationId);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (messageContent: string) => {
      if (!messageContent.trim() || status === "streaming") return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: messageContent.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setStatus("streaming");
      setError(null);

      const assistantMessageId = crypto.randomUUID();
      setStreamingMessageId(assistantMessageId);
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
      ]);

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/llm/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: messageContent.trim(),
            systemPrompt,
            conversationId: currentConversationId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error: ${response.status}`);
        }

        const newConversationId = response.headers.get("X-Conversation-Id");
        if (newConversationId && !currentConversationId) {
          setCurrentConversationId(newConversationId);
          onConversationStart?.(newConversationId);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent }
                : msg,
            ),
          );
        }

        setStatus("idle");
        setStreamingMessageId(null);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("idle");
          setStreamingMessageId(null);
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        setStatus("error");
        setStreamingMessageId(null);

        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId),
        );
      } finally {
        abortControllerRef.current = null;
      }
    },
    [status, systemPrompt, currentConversationId, onConversationStart],
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    setStatus("idle");
    setStreamingMessageId(null);
  }, []);

  const retry = useCallback(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === "user");
    if (lastUserMessage) {
      setMessages((prev) => prev.slice(0, -1));
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          streamingMessageId={streamingMessageId ?? undefined}
        />
      </div>

      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 border-3 border-red-500 bg-red-50 dark:bg-red-950 p-3">
          <span className="text-sm text-red-600 dark:text-red-400 font-bold">
            {error}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retry}
            className="ml-auto border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isStreaming={status === "streaming"}
      />
    </div>
  );
}
