import { NextResponse } from "next/server";
import { signUpInputDtoSchema } from "@/application/dto/sign-up.dto";
import { getInjection } from "@/common/di/container";

export async function signUpController(request: Request) {
  const json = await request.json();
  const parsed = signUpInputDtoSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("SignUpUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue(), { status: 201 });
}
