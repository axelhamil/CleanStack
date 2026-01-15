import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { ConversationId } from "../conversation-id";
import { type IMessageProps, Message } from "../entities/message.entity";
import { MessageId } from "../entities/message-id";
import { Cost, type CostValue } from "../value-objects/cost.vo";
import { MessageContent } from "../value-objects/message-content.vo";
import {
  MessageRole,
  type MessageRoleType,
} from "../value-objects/message-role.vo";
import {
  TokenUsage,
  type TokenUsageValue,
} from "../value-objects/token-usage.vo";

describe("Message Entity", () => {
  const createValidProps = () => ({
    conversationId: ConversationId.create(new UUID()),
    role: MessageRole.create("user" as MessageRoleType).getValue(),
    content: MessageContent.create("Hello, world!" as string).getValue(),
    model: Option.none<string>(),
    tokenUsage: Option.none<TokenUsage>(),
    cost: Option.none<Cost>(),
  });

  describe("create()", () => {
    it("should create message with valid props", () => {
      const props = createValidProps();

      const message = Message.create(props);

      expect(message).toBeInstanceOf(Message);
      expect(message.id).toBeInstanceOf(MessageId);
      expect(message.get("role")).toBe(props.role);
      expect(message.get("content")).toBe(props.content);
      expect(message.get("createdAt")).toBeInstanceOf(Date);
    });

    it("should create message with provided id", () => {
      const props = createValidProps();
      const customId = new UUID();

      const message = Message.create(props, customId);

      expect(message.id.value).toBe(customId.value);
    });

    it("should generate new id when not provided", () => {
      const props = createValidProps();

      const message1 = Message.create(props);
      const message2 = Message.create(props);

      expect(message1.id.value).not.toBe(message2.id.value);
    });

    it("should create message with assistant role", () => {
      const props = {
        ...createValidProps(),
        role: MessageRole.create("assistant" as MessageRoleType).getValue(),
      };

      const message = Message.create(props);

      expect(message.get("role").value).toBe("assistant");
    });

    it("should create message with system role", () => {
      const props = {
        ...createValidProps(),
        role: MessageRole.create("system" as MessageRoleType).getValue(),
      };

      const message = Message.create(props);

      expect(message.get("role").value).toBe("system");
    });

    it("should create message with model", () => {
      const props = {
        ...createValidProps(),
        model: Option.some("gpt-4"),
      };

      const message = Message.create(props);

      expect(message.get("model").isSome()).toBe(true);
      expect(message.get("model").unwrap()).toBe("gpt-4");
    });

    it("should create message with token usage", () => {
      const tokenUsage = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();
      const props = {
        ...createValidProps(),
        tokenUsage: Option.some(tokenUsage),
      };

      const message = Message.create(props);

      expect(message.get("tokenUsage").isSome()).toBe(true);
      expect(message.get("tokenUsage").unwrap().inputTokens).toBe(100);
    });

    it("should create message with cost", () => {
      const cost = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();
      const props = {
        ...createValidProps(),
        cost: Option.some(cost),
      };

      const message = Message.create(props);

      expect(message.get("cost").isSome()).toBe(true);
      expect(message.get("cost").unwrap().amount).toBe(0.05);
    });

    it("should set createdAt automatically", () => {
      const beforeCreate = new Date();
      const props = createValidProps();

      const message = Message.create(props);

      const afterCreate = new Date();
      const createdAt = message.get("createdAt");
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe("reconstitute()", () => {
    it("should reconstitute message from stored data", () => {
      const uuid = new UUID();
      const messageId = MessageId.create(uuid);
      const createdAt = new Date("2024-01-01T00:00:00Z");
      const props: IMessageProps = {
        ...createValidProps(),
        createdAt,
      };

      const message = Message.reconstitute(props, messageId);

      expect(message).toBeInstanceOf(Message);
      expect(message.id.value).toBe(uuid.value);
      expect(message.get("createdAt")).toBe(createdAt);
    });

    it("should preserve all props when reconstituting", () => {
      const uuid = new UUID();
      const messageId = MessageId.create(uuid);
      const tokenUsage = TokenUsage.create({
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      } as TokenUsageValue).getValue();
      const cost = Cost.create({
        amount: 0.05,
        currency: "USD",
      } as CostValue).getValue();
      const props: IMessageProps = {
        conversationId: ConversationId.create(new UUID()),
        role: MessageRole.create("assistant" as MessageRoleType).getValue(),
        content: MessageContent.create("Response text" as string).getValue(),
        model: Option.some("gpt-4"),
        tokenUsage: Option.some(tokenUsage),
        cost: Option.some(cost),
        createdAt: new Date("2024-01-01T00:00:00Z"),
      };

      const message = Message.reconstitute(props, messageId);

      expect(message.get("role").value).toBe("assistant");
      expect(message.get("content").value).toBe("Response text");
      expect(message.get("model").unwrap()).toBe("gpt-4");
      expect(message.get("tokenUsage").unwrap().inputTokens).toBe(100);
      expect(message.get("cost").unwrap().amount).toBe(0.05);
    });
  });

  describe("id", () => {
    it("should return MessageId instance", () => {
      const message = Message.create(createValidProps());

      expect(message.id).toBeInstanceOf(MessageId);
    });

    it("should return consistent id", () => {
      const message = Message.create(createValidProps());

      expect(message.id.value).toBe(message.id.value);
    });
  });
});
