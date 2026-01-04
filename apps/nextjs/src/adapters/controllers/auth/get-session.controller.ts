import { match } from "@packages/ddd-kit";
import { NextResponse } from "next/server";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

export async function getSessionController(request: Request) {
  const headers = request.headers;
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headers);

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return match<
    IGetSessionOutputDto,
    NextResponse<IGetSessionOutputDto> | NextResponse<null>
  >(result.getValue(), {
    Some: (session) => NextResponse.json(session),
    None: () => NextResponse.json(null, { status: 401 }),
  });
}
