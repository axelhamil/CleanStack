import { NextResponse } from "next/server";
import { signInInputDtoSchema } from "@/application/dto/sign-in.dto";
import { getInjection } from "@/common/di/container";

export async function signInController(request: Request) {
  const json = await request.json();
  const parsed = signInInputDtoSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SignInUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 401 });
  }

  return NextResponse.json(result.getValue());
}
