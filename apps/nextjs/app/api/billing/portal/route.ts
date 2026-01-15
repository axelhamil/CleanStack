import { requireAuth } from "@/adapters/guards/auth.guard";
import { getInjection } from "@/common/di/container";

export async function POST() {
  const session = await requireAuth();

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/settings/billing`;

  const useCase = getInjection("CreatePortalSessionUseCase");
  const result = await useCase.execute({
    userId: session.user.id,
    returnUrl,
  });

  if (result.isFailure) {
    return Response.json({ error: result.getError() }, { status: 400 });
  }

  return Response.json(result.getValue());
}
