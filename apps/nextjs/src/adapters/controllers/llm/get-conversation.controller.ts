import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { getInjection } from "@/common/di/container";

export async function getConversationController(
  _request: Request,
  conversationId: string,
) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const useCase = getInjection("GetConversationUseCase");
  const result = await useCase.execute({
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
