"use server";

import type { ICheckBudgetOutputDto } from "@/application/dto/llm/check-budget.dto";
import { checkBudgetInputDtoSchema } from "@/application/dto/llm/check-budget.dto";
import type { IGetUsageStatsOutputDto } from "@/application/dto/llm/get-usage-stats.dto";
import { getUsageStatsInputDtoSchema } from "@/application/dto/llm/get-usage-stats.dto";
import { getInjection } from "@/common/di/container";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getUsageStatsAction(
  input: unknown,
): Promise<ActionResult<IGetUsageStatsOutputDto>> {
  const parsed = getUsageStatsInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("GetUsageStatsUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function checkBudgetAction(
  input: unknown,
): Promise<ActionResult<ICheckBudgetOutputDto>> {
  const parsed = checkBudgetInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("CheckBudgetUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}
