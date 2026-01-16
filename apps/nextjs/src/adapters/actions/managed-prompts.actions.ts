"use server";

import type { ICreateManagedPromptOutputDto } from "@/application/dto/llm/create-managed-prompt.dto";
import { createManagedPromptInputDtoSchema } from "@/application/dto/llm/create-managed-prompt.dto";
import type { IGetManagedPromptOutputDto } from "@/application/dto/llm/get-managed-prompt.dto";
import { getManagedPromptInputDtoSchema } from "@/application/dto/llm/get-managed-prompt.dto";
import type { IListManagedPromptsOutputDto } from "@/application/dto/llm/list-managed-prompts.dto";
import { listManagedPromptsInputDtoSchema } from "@/application/dto/llm/list-managed-prompts.dto";
import type { IRollbackManagedPromptOutputDto } from "@/application/dto/llm/rollback-managed-prompt.dto";
import { rollbackManagedPromptInputDtoSchema } from "@/application/dto/llm/rollback-managed-prompt.dto";
import type { ITestManagedPromptOutputDto } from "@/application/dto/llm/test-managed-prompt.dto";
import { testManagedPromptInputDtoSchema } from "@/application/dto/llm/test-managed-prompt.dto";
import type { IUpdateManagedPromptOutputDto } from "@/application/dto/llm/update-managed-prompt.dto";
import { updateManagedPromptInputDtoSchema } from "@/application/dto/llm/update-managed-prompt.dto";
import { getInjection } from "@/common/di/container";
import {
  type ActionResult,
  isParseError,
  parseInput,
  toActionResult,
} from "./action.utils";

export async function createManagedPromptAction(
  input: unknown,
): Promise<ActionResult<ICreateManagedPromptOutputDto>> {
  const parsed = parseInput(createManagedPromptInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("CreateManagedPromptUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function updateManagedPromptAction(
  input: unknown,
): Promise<ActionResult<IUpdateManagedPromptOutputDto>> {
  const parsed = parseInput(updateManagedPromptInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("UpdateManagedPromptUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function getManagedPromptAction(
  input: unknown,
): Promise<ActionResult<IGetManagedPromptOutputDto>> {
  const parsed = parseInput(getManagedPromptInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("GetManagedPromptUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function listManagedPromptsAction(
  input: unknown,
): Promise<ActionResult<IListManagedPromptsOutputDto>> {
  const parsed = parseInput(listManagedPromptsInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("ListManagedPromptsUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function rollbackManagedPromptAction(
  input: unknown,
): Promise<ActionResult<IRollbackManagedPromptOutputDto>> {
  const parsed = parseInput(rollbackManagedPromptInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("RollbackManagedPromptUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function testManagedPromptAction(
  input: unknown,
): Promise<ActionResult<ITestManagedPromptOutputDto>> {
  const parsed = parseInput(testManagedPromptInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("TestManagedPromptUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}
