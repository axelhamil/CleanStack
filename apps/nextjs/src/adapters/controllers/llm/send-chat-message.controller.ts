import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { sendChatMessageInputDtoSchema } from "@/application/dto/llm/send-chat-message.dto";
import { getInjection } from "@/common/di/container";

export async function sendChatMessageController(request: Request) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parseResult = sendChatMessageInputDtoSchema
    .omit({ userId: true })
    .safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SendChatMessageUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
