import { NextResponse } from "next/server";
import { authGuard } from "@/adapters/guards/auth.guard";
import { createCheckoutSessionInputDtoSchema } from "@/application/dto/create-checkout-session.dto";
import { getInjection } from "@/common/di/container";

export async function createCheckoutSessionController(request: Request) {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parseResult = createCheckoutSessionInputDtoSchema
    .pick({ priceId: true })
    .safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const useCase = getInjection("CreateCheckoutSessionUseCase");
  const result = await useCase.execute({
    userId: guardResult.session.user.id,
    priceId: parseResult.data.priceId,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  });

  if (result.isFailure) {
    return NextResponse.json({ error: result.getError() }, { status: 400 });
  }

  return NextResponse.json(result.getValue());
}
