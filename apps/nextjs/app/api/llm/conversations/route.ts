import { listConversationsController } from "@/adapters/controllers/llm/list-conversations.controller";
import { sendChatMessageController } from "@/adapters/controllers/llm/send-chat-message.controller";

export async function GET(request: Request) {
  return listConversationsController(request);
}

export async function POST(request: Request) {
  return sendChatMessageController(request);
}
