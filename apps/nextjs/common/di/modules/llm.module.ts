import { createModule } from "@evyweb/ioctopus";
import { DrizzleConversationRepository } from "@/adapters/repositories/llm/conversation.repository";
import { DrizzleLLMUsageRepository } from "@/adapters/repositories/llm/llm-usage.repository";
import { DrizzleManagedPromptRepository } from "@/adapters/repositories/llm/managed-prompt.repository";
import { DrizzleMessageRepository } from "@/adapters/repositories/llm/message.repository";
import { AISDKLLMProvider } from "@/adapters/services/llm/ai-sdk-llm.provider";
import { ModelRouterService } from "@/adapters/services/llm/model-router.service";
import { CheckBudgetUseCase } from "@/application/use-cases/llm/check-budget.use-case";
import { DeleteConversationUseCase } from "@/application/use-cases/llm/delete-conversation.use-case";
import { EstimateCostUseCase } from "@/application/use-cases/llm/estimate-cost.use-case";
import { GetConversationUseCase } from "@/application/use-cases/llm/get-conversation.use-case";
import { GetUsageStatsUseCase } from "@/application/use-cases/llm/get-usage-stats.use-case";
import { ListConversationsUseCase } from "@/application/use-cases/llm/list-conversations.use-case";
import { ListMessagesUseCase } from "@/application/use-cases/llm/list-messages.use-case";
import { CreateManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/create-managed-prompt.use-case";
import { GetManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/get-managed-prompt.use-case";
import { ListManagedPromptsUseCase } from "@/application/use-cases/llm/managed-prompts/list-managed-prompts.use-case";
import { RollbackManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/rollback-managed-prompt.use-case";
import { TestManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/test-managed-prompt.use-case";
import { UpdateManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/update-managed-prompt.use-case";
import { SelectOptimalModelUseCase } from "@/application/use-cases/llm/select-optimal-model.use-case";
import { SendChatMessageUseCase } from "@/application/use-cases/llm/send-chat-message.use-case";
import { SendCompletionUseCase } from "@/application/use-cases/llm/send-completion.use-case";
import { StreamCompletionUseCase } from "@/application/use-cases/llm/stream-completion.use-case";
import { DEFAULT_MODEL_CONFIGS } from "@/common/llm/config";
import { DI_SYMBOLS } from "../types";

export const createLLMModule = () => {
  const llmModule = createModule();

  // Repositories
  llmModule
    .bind(DI_SYMBOLS.IConversationRepository)
    .toClass(DrizzleConversationRepository);

  llmModule
    .bind(DI_SYMBOLS.IMessageRepository)
    .toClass(DrizzleMessageRepository);

  llmModule
    .bind(DI_SYMBOLS.IManagedPromptRepository)
    .toClass(DrizzleManagedPromptRepository);

  llmModule
    .bind(DI_SYMBOLS.ILLMUsageRepository)
    .toClass(DrizzleLLMUsageRepository);

  // Providers and Services
  llmModule.bind(DI_SYMBOLS.ILLMProvider).toClass(AISDKLLMProvider);

  llmModule
    .bind(DI_SYMBOLS.IModelRouter)
    .toHigherOrderFunction(
      () => new ModelRouterService(DEFAULT_MODEL_CONFIGS),
      [],
    );

  // Completion Use Cases
  llmModule
    .bind(DI_SYMBOLS.SendCompletionUseCase)
    .toClass(SendCompletionUseCase, [
      DI_SYMBOLS.ILLMProvider,
      DI_SYMBOLS.IModelRouter,
      DI_SYMBOLS.ILLMUsageRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  llmModule
    .bind(DI_SYMBOLS.StreamCompletionUseCase)
    .toClass(StreamCompletionUseCase, [
      DI_SYMBOLS.ILLMProvider,
      DI_SYMBOLS.IModelRouter,
      DI_SYMBOLS.ILLMUsageRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  llmModule
    .bind(DI_SYMBOLS.SendChatMessageUseCase)
    .toClass(SendChatMessageUseCase, [
      DI_SYMBOLS.ILLMProvider,
      DI_SYMBOLS.IModelRouter,
      DI_SYMBOLS.IConversationRepository,
      DI_SYMBOLS.IMessageRepository,
      DI_SYMBOLS.ILLMUsageRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  // Conversation Use Cases
  llmModule
    .bind(DI_SYMBOLS.GetConversationUseCase)
    .toClass(GetConversationUseCase, [DI_SYMBOLS.IConversationRepository]);

  llmModule
    .bind(DI_SYMBOLS.ListConversationsUseCase)
    .toClass(ListConversationsUseCase, [
      DI_SYMBOLS.IConversationRepository,
      DI_SYMBOLS.IMessageRepository,
    ]);

  llmModule
    .bind(DI_SYMBOLS.ListMessagesUseCase)
    .toClass(ListMessagesUseCase, [
      DI_SYMBOLS.IConversationRepository,
      DI_SYMBOLS.IMessageRepository,
    ]);

  llmModule
    .bind(DI_SYMBOLS.DeleteConversationUseCase)
    .toClass(DeleteConversationUseCase, [
      DI_SYMBOLS.IConversationRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  // Managed Prompts Use Cases
  llmModule
    .bind(DI_SYMBOLS.CreateManagedPromptUseCase)
    .toClass(CreateManagedPromptUseCase, [
      DI_SYMBOLS.IManagedPromptRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  llmModule
    .bind(DI_SYMBOLS.UpdateManagedPromptUseCase)
    .toClass(UpdateManagedPromptUseCase, [
      DI_SYMBOLS.IManagedPromptRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  llmModule
    .bind(DI_SYMBOLS.GetManagedPromptUseCase)
    .toClass(GetManagedPromptUseCase, [DI_SYMBOLS.IManagedPromptRepository]);

  llmModule
    .bind(DI_SYMBOLS.ListManagedPromptsUseCase)
    .toClass(ListManagedPromptsUseCase, [DI_SYMBOLS.IManagedPromptRepository]);

  llmModule
    .bind(DI_SYMBOLS.RollbackManagedPromptUseCase)
    .toClass(RollbackManagedPromptUseCase, [
      DI_SYMBOLS.IManagedPromptRepository,
      DI_SYMBOLS.IEventDispatcher,
    ]);

  llmModule
    .bind(DI_SYMBOLS.TestManagedPromptUseCase)
    .toClass(TestManagedPromptUseCase, [
      DI_SYMBOLS.IManagedPromptRepository,
      DI_SYMBOLS.ILLMProvider,
    ]);

  // Model Selection Use Cases
  llmModule
    .bind(DI_SYMBOLS.SelectOptimalModelUseCase)
    .toClass(SelectOptimalModelUseCase, [DI_SYMBOLS.IModelRouter]);

  llmModule
    .bind(DI_SYMBOLS.EstimateCostUseCase)
    .toClass(EstimateCostUseCase, [
      DI_SYMBOLS.ILLMProvider,
      DI_SYMBOLS.IModelRouter,
    ]);

  // Usage Stats Use Cases
  llmModule
    .bind(DI_SYMBOLS.GetUsageStatsUseCase)
    .toClass(GetUsageStatsUseCase, [DI_SYMBOLS.ILLMUsageRepository]);

  llmModule
    .bind(DI_SYMBOLS.CheckBudgetUseCase)
    .toClass(CheckBudgetUseCase, [DI_SYMBOLS.ILLMUsageRepository]);

  return llmModule;
};
