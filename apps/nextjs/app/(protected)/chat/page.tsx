import { requireAuth } from "@/adapters/guards/auth.guard";
import { ChatInterface } from "./_components/chat-interface";

export default async function ChatPage() {
  await requireAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b-3 border-black dark:border-white pb-4">
        <h1 className="font-black text-3xl uppercase tracking-tight">Chat</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          AI-powered conversations with multiple providers
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}
