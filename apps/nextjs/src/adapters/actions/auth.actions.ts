"use server";

import { match } from "@packages/ddd-kit";
import { headers } from "next/headers";
import type { IGetSessionOutputDto } from "@/application/dto/get-session.dto";
import type { ISignInOutputDto } from "@/application/dto/sign-in.dto";
import { signInInputDtoSchema } from "@/application/dto/sign-in.dto";
import type { ISignOutOutputDto } from "@/application/dto/sign-out.dto";
import type { ISignUpOutputDto } from "@/application/dto/sign-up.dto";
import { signUpInputDtoSchema } from "@/application/dto/sign-up.dto";
import { getInjection } from "@/common/di/container";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function signInAction(
  input: unknown,
): Promise<ActionResult<ISignInOutputDto>> {
  const parsed = signInInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("SignInUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function signUpAction(
  input: unknown,
): Promise<ActionResult<ISignUpOutputDto>> {
  const parsed = signUpInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("SignUpUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function signOutAction(): Promise<
  ActionResult<ISignOutOutputDto>
> {
  const headersList = await headers();
  const useCase = getInjection("SignOutUseCase");
  const result = await useCase.execute(headersList);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function getSessionAction(): Promise<
  ActionResult<IGetSessionOutputDto | null>
> {
  const headersList = await headers();
  const useCase = getInjection("GetSessionUseCase");
  const result = await useCase.execute(headersList);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return match<IGetSessionOutputDto, ActionResult<IGetSessionOutputDto | null>>(
    result.getValue(),
    {
      Some: (session) => ({ success: true, data: session }),
      None: () => ({ success: true, data: null }),
    },
  );
}
