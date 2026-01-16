import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { UserId } from "@/domain/user/user-id";
import { ConversationId } from "../../conversation/conversation-id";
import { Cost } from "../../conversation/value-objects/cost.vo";
import { UsageRecordedEvent } from "../events/usage-recorded.event";
import { LLMUsage } from "../llm-usage.aggregate";
import { Duration } from "../value-objects/duration.vo";
import { ModelIdentifier } from "../value-objects/model-identifier.vo";
import {
  ProviderIdentifier,
  type ProviderType,
} from "../value-objects/provider-identifier.vo";
import { TokenCount } from "../value-objects/token-count.vo";

describe("LLMUsage", () => {
  const createValidProps = () => {
    return {
      userId: Option.some(UserId.create(new UUID())),
      conversationId: Option.some(ConversationId.create(new UUID())),
      provider: ProviderIdentifier.create("openai" as ProviderType).getValue(),
      model: ModelIdentifier.create("gpt-4o" as string).getValue(),
      inputTokens: TokenCount.create(100 as number).getValue(),
      outputTokens: TokenCount.create(50 as number).getValue(),
      cost: Cost.create({ amount: 0.01, currency: "USD" }).getValue(),
      requestDuration: Option.some(Duration.create(1500 as number).getValue()),
      promptKey: Option.some("welcome-message"),
    };
  };

  describe("create()", () => {
    it("should create LLMUsage with all properties", () => {
      const props = createValidProps();

      const usage = LLMUsage.create(props);

      expect(usage.get("provider").value).toBe("openai");
      expect(usage.get("model").value).toBe("gpt-4o");
      expect(usage.get("inputTokens").value).toBe(100);
      expect(usage.get("outputTokens").value).toBe(50);
      expect(usage.get("cost").amount).toBe(0.01);
    });

    it("should create with generated UUID if not provided", () => {
      const props = createValidProps();

      const usage = LLMUsage.create(props);

      expect(usage.id.value).toBeDefined();
      expect(typeof usage.id.value).toBe("string");
    });

    it("should create with provided UUID", () => {
      const props = createValidProps();
      const customId = new UUID<string>("custom-usage-id");

      const usage = LLMUsage.create(props, customId);

      expect(usage.id.value).toBe("custom-usage-id");
    });

    it("should set createdAt to current date", () => {
      const props = createValidProps();
      const before = new Date();

      const usage = LLMUsage.create(props);

      const after = new Date();
      expect(usage.get("createdAt").getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(usage.get("createdAt").getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it("should emit UsageRecordedEvent", () => {
      const props = createValidProps();

      const usage = LLMUsage.create(props);

      expect(usage.domainEvents).toHaveLength(1);
      expect(usage.domainEvents[0]).toBeInstanceOf(UsageRecordedEvent);
    });

    it("should create with optional userId as None", () => {
      const props = {
        ...createValidProps(),
        userId: Option.none<UserId>(),
      };

      const usage = LLMUsage.create(props);

      expect(usage.get("userId").isNone()).toBe(true);
    });

    it("should create with optional conversationId as None", () => {
      const props = {
        ...createValidProps(),
        conversationId: Option.none<ConversationId>(),
      };

      const usage = LLMUsage.create(props);

      expect(usage.get("conversationId").isNone()).toBe(true);
    });

    it("should create with optional requestDuration as None", () => {
      const props = {
        ...createValidProps(),
        requestDuration: Option.none<Duration>(),
      };

      const usage = LLMUsage.create(props);

      expect(usage.get("requestDuration").isNone()).toBe(true);
    });

    it("should create with optional promptKey as None", () => {
      const props = {
        ...createValidProps(),
        promptKey: Option.none<string>(),
      };

      const usage = LLMUsage.create(props);

      expect(usage.get("promptKey").isNone()).toBe(true);
    });
  });

  describe("reconstitute()", () => {
    it("should reconstitute LLMUsage without events", () => {
      const props = {
        ...createValidProps(),
        createdAt: new Date("2024-01-01"),
      };
      const id = new UUID<string>("existing-id");

      const usage = LLMUsage.reconstitute(props, id);

      expect(usage.domainEvents).toHaveLength(0);
      expect(usage.id.value).toBe("existing-id");
      expect(usage.get("createdAt")).toEqual(new Date("2024-01-01"));
    });
  });

  describe("id getter", () => {
    it("should return LLMUsageId", () => {
      const props = createValidProps();
      const usage = LLMUsage.create(props);

      const id = usage.id;

      expect(id.constructor.name).toBe("LLMUsageId");
    });
  });

  describe("totalTokens", () => {
    it("should calculate total tokens", () => {
      const props = createValidProps();
      const usage = LLMUsage.create(props);

      expect(usage.totalTokens).toBe(150);
    });
  });
});
