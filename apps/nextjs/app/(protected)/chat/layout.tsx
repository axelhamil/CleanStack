import type { ReactElement, ReactNode } from "react";
import { ConversationSidebar } from "./_components/conversation-sidebar";

export default function ChatLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <div className="flex h-full gap-6">
      <ConversationSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
