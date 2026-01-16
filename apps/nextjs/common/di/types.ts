import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IEmailService } from "@/application/ports/email.service.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { ILLMProvider } from "@/application/ports/llm.provider.port";
import type { ILLMUsageRepository } from "@/application/ports/llm-usage.repository.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import type { IMessageRepository } from "@/application/ports/message.repository.port";
import type { IModelRouter } from "@/application/ports/model-router.port";
import type { IPaymentProvider } from "@/application/ports/payment.provider.port";
import type { ISubscriptionRepository } from "@/application/ports/subscription.repository.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import type { GetSessionUseCase } from "@/application/use-cases/auth/get-session.use-case";
import type { SignInUseCase } from "@/application/use-cases/auth/sign-in.use-case";
import type { SignOutUseCase } from "@/application/use-cases/auth/sign-out.use-case";
import type { SignUpUseCase } from "@/application/use-cases/auth/sign-up.use-case";
import type { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import type { CreateCheckoutSessionUseCase } from "@/application/use-cases/billing/create-checkout-session.use-case";
import type { CreatePortalSessionUseCase } from "@/application/use-cases/billing/create-portal-session.use-case";
import type { HandleStripeWebhookUseCase } from "@/application/use-cases/billing/handle-stripe-webhook.use-case";
import type { CheckBudgetUseCase } from "@/application/use-cases/llm/check-budget.use-case";
import type { DeleteConversationUseCase } from "@/application/use-cases/llm/delete-conversation.use-case";
import type { EstimateCostUseCase } from "@/application/use-cases/llm/estimate-cost.use-case";
import type { GetConversationUseCase } from "@/application/use-cases/llm/get-conversation.use-case";
import type { GetUsageStatsUseCase } from "@/application/use-cases/llm/get-usage-stats.use-case";
import type { ListConversationsUseCase } from "@/application/use-cases/llm/list-conversations.use-case";
import type { ListMessagesUseCase } from "@/application/use-cases/llm/list-messages.use-case";
import type { CreateManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/create-managed-prompt.use-case";
import type { GetManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/get-managed-prompt.use-case";
import type { ListManagedPromptsUseCase } from "@/application/use-cases/llm/managed-prompts/list-managed-prompts.use-case";
import type { RollbackManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/rollback-managed-prompt.use-case";
import type { TestManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/test-managed-prompt.use-case";
import type { UpdateManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/update-managed-prompt.use-case";
import type { SelectOptimalModelUseCase } from "@/application/use-cases/llm/select-optimal-model.use-case";
import type { SendChatMessageUseCase } from "@/application/use-cases/llm/send-chat-message.use-case";
import type { SendCompletionUseCase } from "@/application/use-cases/llm/send-completion.use-case";
import type { StreamCompletionUseCase } from "@/application/use-cases/llm/stream-completion.use-case";

export const DI_SYMBOLS = {
  IUserRepository: Symbol.for("IUserRepository"),
  ISubscriptionRepository: Symbol.for("ISubscriptionRepository"),
  IConversationRepository: Symbol.for("IConversationRepository"),
  IMessageRepository: Symbol.for("IMessageRepository"),
  IManagedPromptRepository: Symbol.for("IManagedPromptRepository"),
  ILLMUsageRepository: Symbol.for("ILLMUsageRepository"),
  IAuthProvider: Symbol.for("IAuthProvider"),
  IPaymentProvider: Symbol.for("IPaymentProvider"),
  ILLMProvider: Symbol.for("ILLMProvider"),
  IModelRouter: Symbol.for("IModelRouter"),
  IEmailService: Symbol.for("IEmailService"),
  IEventDispatcher: Symbol.for("IEventDispatcher"),
  SignInUseCase: Symbol.for("SignInUseCase"),
  SignUpUseCase: Symbol.for("SignUpUseCase"),
  SignOutUseCase: Symbol.for("SignOutUseCase"),
  GetSessionUseCase: Symbol.for("GetSessionUseCase"),
  VerifyEmailUseCase: Symbol.for("VerifyEmailUseCase"),
  CreateCheckoutSessionUseCase: Symbol.for("CreateCheckoutSessionUseCase"),
  CreatePortalSessionUseCase: Symbol.for("CreatePortalSessionUseCase"),
  HandleStripeWebhookUseCase: Symbol.for("HandleStripeWebhookUseCase"),
  SendCompletionUseCase: Symbol.for("SendCompletionUseCase"),
  StreamCompletionUseCase: Symbol.for("StreamCompletionUseCase"),
  SendChatMessageUseCase: Symbol.for("SendChatMessageUseCase"),
  GetConversationUseCase: Symbol.for("GetConversationUseCase"),
  ListConversationsUseCase: Symbol.for("ListConversationsUseCase"),
  ListMessagesUseCase: Symbol.for("ListMessagesUseCase"),
  DeleteConversationUseCase: Symbol.for("DeleteConversationUseCase"),
  CreateManagedPromptUseCase: Symbol.for("CreateManagedPromptUseCase"),
  UpdateManagedPromptUseCase: Symbol.for("UpdateManagedPromptUseCase"),
  GetManagedPromptUseCase: Symbol.for("GetManagedPromptUseCase"),
  ListManagedPromptsUseCase: Symbol.for("ListManagedPromptsUseCase"),
  RollbackManagedPromptUseCase: Symbol.for("RollbackManagedPromptUseCase"),
  TestManagedPromptUseCase: Symbol.for("TestManagedPromptUseCase"),
  SelectOptimalModelUseCase: Symbol.for("SelectOptimalModelUseCase"),
  EstimateCostUseCase: Symbol.for("EstimateCostUseCase"),
  GetUsageStatsUseCase: Symbol.for("GetUsageStatsUseCase"),
  CheckBudgetUseCase: Symbol.for("CheckBudgetUseCase"),
};

export interface DI_RETURN_TYPES {
  IUserRepository: IUserRepository;
  ISubscriptionRepository: ISubscriptionRepository;
  IConversationRepository: IConversationRepository;
  IMessageRepository: IMessageRepository;
  IManagedPromptRepository: IManagedPromptRepository;
  ILLMUsageRepository: ILLMUsageRepository;
  IAuthProvider: IAuthProvider;
  IPaymentProvider: IPaymentProvider;
  ILLMProvider: ILLMProvider;
  IModelRouter: IModelRouter;
  IEmailService: IEmailService;
  IEventDispatcher: IEventDispatcher;
  SignInUseCase: SignInUseCase;
  SignUpUseCase: SignUpUseCase;
  SignOutUseCase: SignOutUseCase;
  GetSessionUseCase: GetSessionUseCase;
  VerifyEmailUseCase: VerifyEmailUseCase;
  CreateCheckoutSessionUseCase: CreateCheckoutSessionUseCase;
  CreatePortalSessionUseCase: CreatePortalSessionUseCase;
  HandleStripeWebhookUseCase: HandleStripeWebhookUseCase;
  SendCompletionUseCase: SendCompletionUseCase;
  StreamCompletionUseCase: StreamCompletionUseCase;
  SendChatMessageUseCase: SendChatMessageUseCase;
  GetConversationUseCase: GetConversationUseCase;
  ListConversationsUseCase: ListConversationsUseCase;
  ListMessagesUseCase: ListMessagesUseCase;
  DeleteConversationUseCase: DeleteConversationUseCase;
  CreateManagedPromptUseCase: CreateManagedPromptUseCase;
  UpdateManagedPromptUseCase: UpdateManagedPromptUseCase;
  GetManagedPromptUseCase: GetManagedPromptUseCase;
  ListManagedPromptsUseCase: ListManagedPromptsUseCase;
  RollbackManagedPromptUseCase: RollbackManagedPromptUseCase;
  TestManagedPromptUseCase: TestManagedPromptUseCase;
  SelectOptimalModelUseCase: SelectOptimalModelUseCase;
  EstimateCostUseCase: EstimateCostUseCase;
  GetUsageStatsUseCase: GetUsageStatsUseCase;
  CheckBudgetUseCase: CheckBudgetUseCase;
}
