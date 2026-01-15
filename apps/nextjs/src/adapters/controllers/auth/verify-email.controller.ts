import { NextResponse } from "next/server";
import { verifyEmailInputDtoSchema } from "@/application/dto/verify-email.dto";
import { getInjection } from "@/common/di/container";

export async function verifyEmailController(request: Request) {
  const json = await request.json();
  const parsed = verifyEmailInputDtoSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("VerifyEmailUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
