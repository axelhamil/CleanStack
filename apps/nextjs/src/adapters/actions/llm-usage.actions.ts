"use server";

import type { ICheckBudgetOutputDto } from "@/application/dto/llm/check-budget.dto";
import { checkBudgetInputDtoSchema } from "@/application/dto/llm/check-budget.dto";
import type { IGetUsageStatsOutputDto } from "@/application/dto/llm/get-usage-stats.dto";
import { getUsageStatsInputDtoSchema } from "@/application/dto/llm/get-usage-stats.dto";
import { getInjection } from "@/common/di/container";
import {
  type ActionResult,
  isParseError,
  parseInput,
  toActionResult,
} from "./action.utils";

export async function getUsageStatsAction(
  input: unknown,
): Promise<ActionResult<IGetUsageStatsOutputDto>> {
  const parsed = parseInput(getUsageStatsInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("GetUsageStatsUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function checkBudgetAction(
  input: unknown,
): Promise<ActionResult<ICheckBudgetOutputDto>> {
  const parsed = parseInput(checkBudgetInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("CheckBudgetUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}
