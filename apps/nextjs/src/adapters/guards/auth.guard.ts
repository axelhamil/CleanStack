import { match } from "@packages/ddd-kit";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import { getInjection } from "@/common/di/container";

type GuardResult =
  | { authenticated: true; session: IGetSessionOutputDto }
  | { authenticated: false };

export async function authGuard(): Promise<GuardResult> {
  const headersList = await headers();
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headersList);

  if (result.isFailure) {
    return { authenticated: false };
  }

  return match<IGetSessionOutputDto, GuardResult>(result.getValue(), {
    Some: (session) => ({ authenticated: true, session }),
    None: () => ({ authenticated: false }),
  });
}

export async function requireAuth(
  redirectTo = "/login",
): Promise<IGetSessionOutputDto> {
  const guardResult = await authGuard();

  if (!guardResult.authenticated) {
    redirect(redirectTo);
  }

  return guardResult.session;
}
