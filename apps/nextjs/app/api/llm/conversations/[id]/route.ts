import { deleteConversationController } from "@/adapters/controllers/llm/delete-conversation.controller";
import { getConversationController } from "@/adapters/controllers/llm/get-conversation.controller";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return getConversationController(request, id);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return deleteConversationController(request, id);
}
