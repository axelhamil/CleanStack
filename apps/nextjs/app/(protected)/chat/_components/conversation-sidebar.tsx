"use client";

import { cn } from "@packages/ui/index";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ConversationSidebar() {
  const pathname = usePathname();
  const isNewChat = pathname === "/chat";

  return (
    <aside className="w-64 flex-shrink-0 border-r-3 border-black dark:border-white bg-gray-50 dark:bg-gray-900 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b-3 border-black dark:border-white">
          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 font-bold uppercase text-sm tracking-wide transition-all border-3 w-full",
              isNewChat
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                : "bg-white text-black dark:bg-black dark:text-white border-black dark:border-white hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]",
            )}
          >
            <MessageSquarePlus className="h-5 w-5" strokeWidth={2.5} />
            New Chat
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-widest">
              Recent Conversations
            </h3>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessagesSquare className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No conversations yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Start chatting to see your history
              </p>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
