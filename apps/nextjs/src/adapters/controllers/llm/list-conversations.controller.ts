import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { listConversationsInputDtoSchema } from "@/application/dto/llm/list-conversations.dto";
import { getInjection } from "@/common/di/container";

export async function listConversationsController(request: Request) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;

  const parseResult = listConversationsInputDtoSchema
    .omit({ userId: true })
    .safeParse({
      pagination: { page, limit },
    });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("ListConversationsUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
