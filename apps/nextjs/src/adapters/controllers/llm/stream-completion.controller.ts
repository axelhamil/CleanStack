import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { streamCompletionInputDtoSchema } from "@/application/dto/llm/stream-completion.dto";
import { getInjection } from "@/common/di/container";

export async function streamCompletionController(request: Request) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parseResult = streamCompletionInputDtoSchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("StreamCompletionUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  const { stream, model, provider } = result.getValue();

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-LLM-Model": model,
      "X-LLM-Provider": provider,
    },
  });
}
