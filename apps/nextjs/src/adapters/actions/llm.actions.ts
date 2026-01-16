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
import {
  type ActionResult,
  isParseError,
  parseInput,
  toActionResult,
} from "./action.utils";

export async function sendCompletionAction(
  input: unknown,
): Promise<ActionResult<ISendCompletionOutputDto>> {
  const parsed = parseInput(sendCompletionInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("SendCompletionUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function sendChatMessageAction(
  input: unknown,
): Promise<ActionResult<ISendChatMessageOutputDto>> {
  const parsed = parseInput(sendChatMessageInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("SendChatMessageUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function getConversationAction(
  input: unknown,
): Promise<ActionResult<IGetConversationOutputDto>> {
  const parsed = parseInput(getConversationInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("GetConversationUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function listConversationsAction(
  input: unknown,
): Promise<ActionResult<IListConversationsOutputDto>> {
  const parsed = parseInput(listConversationsInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("ListConversationsUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function listMessagesAction(
  input: unknown,
): Promise<ActionResult<IListMessagesOutputDto>> {
  const parsed = parseInput(listMessagesInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("ListMessagesUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function deleteConversationAction(
  input: unknown,
): Promise<ActionResult<IDeleteConversationOutputDto>> {
  const parsed = parseInput(deleteConversationInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const transaction = getInjection("ITransactionManagerService");
  const useCase = getInjection("DeleteConversationUseCase");

  const result = await transaction.startTransaction(async (trx) => {
    return useCase.execute(parsed.data, trx);
  });

  return toActionResult(result);
}

export async function selectOptimalModelAction(
  input: unknown,
): Promise<ActionResult<ISelectOptimalModelOutputDto>> {
  const parsed = parseInput(selectOptimalModelInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("SelectOptimalModelUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}

export async function estimateCostAction(
  input: unknown,
): Promise<ActionResult<IEstimateCostOutputDto>> {
  const parsed = parseInput(estimateCostInputDtoSchema, input);
  if (isParseError(parsed)) return parsed;

  const useCase = getInjection("EstimateCostUseCase");
  return toActionResult(await useCase.execute(parsed.data));
}
