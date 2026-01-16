import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { listMessagesInputDtoSchema } from "@/application/dto/llm/list-messages.dto";
import { getInjection } from "@/common/di/container";

export async function listMessagesController(
  request: Request,
  conversationId: string,
) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 50;

  const parseResult = listMessagesInputDtoSchema
    .omit({ userId: true, conversationId: true })
    .safeParse({
      pagination: { page, limit },
    });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("ListMessagesUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    conversationId,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    const error = result.getError();
    if (error === "Conversation not found") {
      return NextResponse.json({ error }, { status: 404 });
    }
    if (error === "Conversation access unauthorized") {
      return NextResponse.json({ error }, { status: 403 });
    }
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
