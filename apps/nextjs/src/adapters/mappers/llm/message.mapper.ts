import { Option, Result, UUID } from "@packages/ddd-kit";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Message } from "@/domain/llm/conversation/entities/message.entity";
import { MessageId } from "@/domain/llm/conversation/entities/message-id";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { MessageContent } from "@/domain/llm/conversation/value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "@/domain/llm/conversation/value-objects/message-role.vo";
import { TokenUsage } from "@/domain/llm/conversation/value-objects/token-usage.vo";

export interface MessagePersistence {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  costAmount: number | null;
  costCurrency: string;
  createdAt: Date;
}

export function messageToDomain(record: MessagePersistence): Result<Message> {
  const id = MessageId.create(new UUID(record.id));
  const conversationId = ConversationId.create(new UUID(record.conversationId));

  const roleResult = MessageRole.create(record.role as MessageRoleType);
  if (roleResult.isFailure) {
    return Result.fail(`Invalid role: ${roleResult.getError()}`);
  }

  const contentResult = MessageContent.create(record.content);
  if (contentResult.isFailure) {
    return Result.fail(`Invalid content: ${contentResult.getError()}`);
  }

  const modelOption: Option<string> =
    record.model !== null ? Option.some(record.model) : Option.none();

  let tokenUsageOption: Option<TokenUsage> = Option.none();
  if (
    record.inputTokens !== null &&
    record.outputTokens !== null &&
    record.totalTokens !== null
  ) {
    const tokenUsageResult = TokenUsage.create({
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      totalTokens: record.totalTokens,
    });
    if (tokenUsageResult.isFailure) {
      return Result.fail(`Invalid token usage: ${tokenUsageResult.getError()}`);
    }
    tokenUsageOption = Option.some(tokenUsageResult.getValue());
  }

  let costOption: Option<Cost> = Option.none();
  if (record.costAmount !== null) {
    const costResult = Cost.create({
      amount: record.costAmount,
      currency: record.costCurrency,
    });
    if (costResult.isFailure) {
      return Result.fail(`Invalid cost: ${costResult.getError()}`);
    }
    costOption = Option.some(costResult.getValue());
  }

  const message = Message.reconstitute(
    {
      conversationId,
      role: roleResult.getValue(),
      content: contentResult.getValue(),
      model: modelOption,
      tokenUsage: tokenUsageOption,
      cost: costOption,
      createdAt: record.createdAt,
    },
    id,
  );

  return Result.ok(message);
}

export function messageToPersistence(message: Message): MessagePersistence {
  const tokenUsage = message.get("tokenUsage");
  const cost = message.get("cost");
  const model = message.get("model");

  return {
    id: String(message.id.value),
    conversationId: String(message.get("conversationId").value),
    role: message.get("role").value,
    content: message.get("content").value,
    model: model.isSome() ? model.unwrap() : null,
    inputTokens: tokenUsage.isSome() ? tokenUsage.unwrap().inputTokens : null,
    outputTokens: tokenUsage.isSome() ? tokenUsage.unwrap().outputTokens : null,
    totalTokens: tokenUsage.isSome() ? tokenUsage.unwrap().totalTokens : null,
    costAmount: cost.isSome() ? cost.unwrap().amount : null,
    costCurrency: cost.isSome() ? cost.unwrap().currency : "USD",
    createdAt: message.get("createdAt"),
  };
}
