import { NextResponse } from "next/server";
import { getInjection } from "@/common/di/container";

export async function signOutController(request: Request) {
  const headers = request.headers;
  const useCase = getInjection("SignOutUseCase");
  const result = await useCase.execute(headers);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: result.getValue() });
}
