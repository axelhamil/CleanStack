"use client";

import { Bot } from "lucide-react";
import { useEffect, useRef } from "react";
import { type Message, MessageBubble } from "./message-bubble";

interface MessageListProps {
  messages: Message[];
  streamingMessageId?: string;
}

export function MessageList({
  messages,
  streamingMessageId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-bold uppercase">
            Start a conversation
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Type a message below to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isStreaming={message.id === streamingMessageId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
