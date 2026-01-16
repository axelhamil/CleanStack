import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { getUsageStatsInputDtoSchema } from "@/application/dto/llm/get-usage-stats.dto";
import { getInjection } from "@/common/di/container";

export async function getUsageStatsController(request: Request) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate") ?? undefined;
  const endDate = url.searchParams.get("endDate") ?? undefined;
  const groupBy = url.searchParams.get("groupBy") ?? undefined;

  const parseResult = getUsageStatsInputDtoSchema
    .omit({ userId: true })
    .safeParse({
      startDate,
      endDate,
      groupBy,
    });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("GetUsageStatsUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
