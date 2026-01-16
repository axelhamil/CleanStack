import { listMessagesController } from "@/adapters/controllers/llm/list-messages.controller";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  return listMessagesController(request, id);
}
