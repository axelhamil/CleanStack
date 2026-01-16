"use server";

import type { IDeleteConversationOutputDto } from "@/application/dto/llm/delete-conversation.dto";
import { deleteConversationInputDtoSchema } from "@/application/dto/llm/delete-conversation.dto";
import type { IEstimateCostOutputDto } from "@/application/dto/llm/estimate-cost.dto";
import { estimateCostInputDtoSchema } from "@/application/dto/llm/estimate-cost.dto";
import type { IGetConversationOutputDto } from "@/application/dto/llm/get-conversation.dto";
import { getConversationInputDtoSchema } from "@/application/dto/llm/get-conversation.dto";
import type { IListConversationsOutputDto } from "@/application/dto/llm/list-conversations.dto";
import { listConversationsInputDtoSchema } from "@/application/dto/llm/list-conversations.dto";
import type { IListMessagesOutputDto } from "@/application/dto/llm/list-messages.dto";
import { listMessagesInputDtoSchema } from "@/application/dto/llm/list-messages.dto";
import type { ISelectOptimalModelOutputDto } from "@/application/dto/llm/select-optimal-model.dto";
import { selectOptimalModelInputDtoSchema } from "@/application/dto/llm/select-optimal-model.dto";
import type { ISendChatMessageOutputDto } from "@/application/dto/llm/send-chat-message.dto";
import { sendChatMessageInputDtoSchema } from "@/application/dto/llm/send-chat-message.dto";
import type { ISendCompletionOutputDto } from "@/application/dto/llm/send-completion.dto";
import { sendCompletionInputDtoSchema } from "@/application/dto/llm/send-completion.dto";
import { getInjection } from "@/common/di/container";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function sendCompletionAction(
  input: unknown,
): Promise<ActionResult<ISendCompletionOutputDto>> {
  const parsed = sendCompletionInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("SendCompletionUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function sendChatMessageAction(
  input: unknown,
): Promise<ActionResult<ISendChatMessageOutputDto>> {
  const parsed = sendChatMessageInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("SendChatMessageUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function getConversationAction(
  input: unknown,
): Promise<ActionResult<IGetConversationOutputDto>> {
  const parsed = getConversationInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("GetConversationUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function listConversationsAction(
  input: unknown,
): Promise<ActionResult<IListConversationsOutputDto>> {
  const parsed = listConversationsInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("ListConversationsUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function listMessagesAction(
  input: unknown,
): Promise<ActionResult<IListMessagesOutputDto>> {
  const parsed = listMessagesInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("ListMessagesUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function deleteConversationAction(
  input: unknown,
): Promise<ActionResult<IDeleteConversationOutputDto>> {
  const parsed = deleteConversationInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("DeleteConversationUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function selectOptimalModelAction(
  input: unknown,
): Promise<ActionResult<ISelectOptimalModelOutputDto>> {
  const parsed = selectOptimalModelInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("SelectOptimalModelUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}

export async function estimateCostAction(
  input: unknown,
): Promise<ActionResult<IEstimateCostOutputDto>> {
  const parsed = estimateCostInputDtoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const useCase = getInjection("EstimateCostUseCase");
  const result = await useCase.execute(parsed.data);

  if (result.isFailure) {
    return { success: false, error: result.getError() };
  }

  return { success: true, data: result.getValue() };
}
