import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { checkBudgetInputDtoSchema } from "@/application/dto/llm/check-budget.dto";
import { getInjection } from "@/common/di/container";

export async function checkBudgetController(request: Request) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const estimatedCost = url.searchParams.get("estimatedCost");

  const parseResult = checkBudgetInputDtoSchema
    .omit({ userId: true })
    .safeParse({
      estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
    });

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CheckBudgetUseCase");
  const result = await useCase.execute({
    ...parseResult.data,
    userId: guardResult.session.user.id,
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
