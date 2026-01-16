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

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createManagedPromptAction(
  input: unknown,
): Promise<ActionResult<ICreateManagedPromptOutputDto>> {
  const parsed = createManagedPromptInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("CreateManagedPromptUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function updateManagedPromptAction(
  input: unknown,
): Promise<ActionResult<IUpdateManagedPromptOutputDto>> {
  const parsed = updateManagedPromptInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("UpdateManagedPromptUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function getManagedPromptAction(
  input: unknown,
): Promise<ActionResult<IGetManagedPromptOutputDto>> {
  const parsed = getManagedPromptInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("GetManagedPromptUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function listManagedPromptsAction(
  input: unknown,
): Promise<ActionResult<IListManagedPromptsOutputDto>> {
  const parsed = listManagedPromptsInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("ListManagedPromptsUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function rollbackManagedPromptAction(
  input: unknown,
): Promise<ActionResult<IRollbackManagedPromptOutputDto>> {
  const parsed = rollbackManagedPromptInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("RollbackManagedPromptUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function testManagedPromptAction(
  input: unknown,
): Promise<ActionResult<ITestManagedPromptOutputDto>> {
  const parsed = testManagedPromptInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("TestManagedPromptUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}
