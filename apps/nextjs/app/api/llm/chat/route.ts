import { streamCompletionController } from "@/adapters/controllers/llm/stream-completion.controller";

export async function POST(request: Request) {
  return streamCompletionController(request);
}
