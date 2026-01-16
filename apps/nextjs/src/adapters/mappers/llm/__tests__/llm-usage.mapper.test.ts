import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { ConversationId } from "@/domain/llm/conversation/conversation-id";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import { Duration } from "@/domain/llm/usage/value-objects/duration.vo";
import { ModelIdentifier } from "@/domain/llm/usage/value-objects/model-identifier.vo";
import { ProviderIdentifier } from "@/domain/llm/usage/value-objects/provider-identifier.vo";
import { TokenCount } from "@/domain/llm/usage/value-objects/token-count.vo";
import { UserId } from "@/domain/user/user-id";
import { llmUsageToDomain, llmUsageToPersistence } from "../llm-usage.mapper";

describe("LLMUsageMapper", () => {
  const testId = "550e8400-e29b-41d4-a716-446655440003";
  const testUserId = "user-123";
  const testConversationId = "550e8400-e29b-41d4-a716-446655440000";
  const testProvider = "openai" as const;
  const testModel = "gpt-4o-mini";
  const testInputTokens = 100;
  const testOutputTokens = 50;
  const testCostAmount = 0.005;
  const testCostCurrency = "USD";
  const testRequestDuration = 1500;
  const testPromptKey = "welcome-email";
  const testCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("llmUsageToDomain()", () => {
    describe("happy path", () => {
      it("should convert a DB record to domain LLMUsage", () => {
        const record = {
          id: testId,
          userId: testUserId,
          conversationId: testConversationId,
          provider: testProvider,
          model: testModel,
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: testRequestDuration,
          promptKey: testPromptKey,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const usage = result.getValue();
        expect(usage.id.value).toBe(testId);
        expect(usage.get("userId").isSome()).toBe(true);
        expect(usage.get("conversationId").isSome()).toBe(true);
        expect(usage.get("provider").value).toBe(testProvider);
        expect(usage.get("model").value).toBe(testModel);
        expect(usage.get("inputTokens").value).toBe(testInputTokens);
        expect(usage.get("outputTokens").value).toBe(testOutputTokens);
        expect(usage.get("cost").amount).toBe(testCostAmount);
        expect(usage.get("requestDuration").isSome()).toBe(true);
        expect(usage.get("promptKey").isSome()).toBe(true);
      });

      it("should handle null userId as Option.none()", () => {
        const record = {
          id: testId,
          userId: null,
          conversationId: testConversationId,
          provider: testProvider,
          model: testModel,
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: null,
          promptKey: null,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const usage = result.getValue();
        expect(usage.get("userId").isNone()).toBe(true);
      });

      it("should handle null conversationId as Option.none()", () => {
        const record = {
          id: testId,
          userId: testUserId,
          conversationId: null,
          provider: testProvider,
          model: testModel,
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: null,
          promptKey: null,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const usage = result.getValue();
        expect(usage.get("conversationId").isNone()).toBe(true);
      });

      it("should handle null requestDuration as Option.none()", () => {
        const record = {
          id: testId,
          userId: testUserId,
          conversationId: testConversationId,
          provider: testProvider,
          model: testModel,
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: null,
          promptKey: testPromptKey,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const usage = result.getValue();
        expect(usage.get("requestDuration").isNone()).toBe(true);
      });

      it("should handle null promptKey as Option.none()", () => {
        const record = {
          id: testId,
          userId: testUserId,
          conversationId: testConversationId,
          provider: testProvider,
          model: testModel,
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: testRequestDuration,
          promptKey: null,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isSuccess).toBe(true);
        const usage = result.getValue();
        expect(usage.get("promptKey").isNone()).toBe(true);
      });
    });

    describe("error handling", () => {
      it("should fail when provider is invalid", () => {
        const record = {
          id: testId,
          userId: testUserId,
          conversationId: testConversationId,
          provider: "invalid-provider" as "openai",
          model: testModel,
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: null,
          promptKey: null,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("provider");
      });

      it("should fail when model is empty", () => {
        const record = {
          id: testId,
          userId: testUserId,
          conversationId: testConversationId,
          provider: testProvider,
          model: "",
          inputTokens: testInputTokens,
          outputTokens: testOutputTokens,
          costAmount: testCostAmount,
          costCurrency: testCostCurrency,
          requestDuration: null,
          promptKey: null,
          createdAt: testCreatedAt,
        };

        const result = llmUsageToDomain(record);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("model");
      });
    });
  });

  describe("llmUsageToPersistence()", () => {
    let usage: LLMUsage;

    beforeEach(() => {
      const providerResult = ProviderIdentifier.create(
        testProvider as "openai" | "anthropic" | "google",
      );
      const modelResult = ModelIdentifier.create(testModel as string);
      const inputTokensResult = TokenCount.create(testInputTokens as number);
      const outputTokensResult = TokenCount.create(testOutputTokens as number);
      const costResult = Cost.create({
        amount: testCostAmount,
        currency: testCostCurrency,
      } as { amount: number; currency: string });
      const durationResult = Duration.create(testRequestDuration as number);

      usage = LLMUsage.create(
        {
          userId: Option.some(UserId.create(new UUID(testUserId))),
          conversationId: Option.some(
            ConversationId.create(new UUID(testConversationId)),
          ),
          provider: providerResult.getValue(),
          model: modelResult.getValue(),
          inputTokens: inputTokensResult.getValue(),
          outputTokens: outputTokensResult.getValue(),
          cost: costResult.getValue(),
          requestDuration: Option.some(durationResult.getValue()),
          promptKey: Option.some(testPromptKey),
        },
        new UUID(testId),
      );
    });

    it("should convert domain LLMUsage to persistence format", () => {
      const persistence = llmUsageToPersistence(usage);

      expect(persistence.id).toBe(testId);
      expect(persistence.userId).toBe(testUserId);
      expect(persistence.conversationId).toBe(testConversationId);
      expect(persistence.provider).toBe(testProvider);
      expect(persistence.model).toBe(testModel);
      expect(persistence.inputTokens).toBe(testInputTokens);
      expect(persistence.outputTokens).toBe(testOutputTokens);
      expect(persistence.costAmount).toBe(testCostAmount);
      expect(persistence.costCurrency).toBe(testCostCurrency);
      expect(persistence.requestDuration).toBe(testRequestDuration);
      expect(persistence.promptKey).toBe(testPromptKey);
    });

    it("should convert Option.none() userId to null", () => {
      const providerResult = ProviderIdentifier.create(
        testProvider as "openai" | "anthropic" | "google",
      );
      const modelResult = ModelIdentifier.create(testModel as string);
      const inputTokensResult = TokenCount.create(testInputTokens as number);
      const outputTokensResult = TokenCount.create(testOutputTokens as number);
      const costResult = Cost.create({
        amount: testCostAmount,
        currency: testCostCurrency,
      } as { amount: number; currency: string });

      const usageWithoutUser = LLMUsage.create(
        {
          userId: Option.none(),
          conversationId: Option.none(),
          provider: providerResult.getValue(),
          model: modelResult.getValue(),
          inputTokens: inputTokensResult.getValue(),
          outputTokens: outputTokensResult.getValue(),
          cost: costResult.getValue(),
          requestDuration: Option.none(),
          promptKey: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = llmUsageToPersistence(usageWithoutUser);

      expect(persistence.userId).toBeNull();
      expect(persistence.conversationId).toBeNull();
    });

    it("should convert Option.none() requestDuration to null", () => {
      const providerResult = ProviderIdentifier.create(
        testProvider as "openai" | "anthropic" | "google",
      );
      const modelResult = ModelIdentifier.create(testModel as string);
      const inputTokensResult = TokenCount.create(testInputTokens as number);
      const outputTokensResult = TokenCount.create(testOutputTokens as number);
      const costResult = Cost.create({
        amount: testCostAmount,
        currency: testCostCurrency,
      } as { amount: number; currency: string });

      const usageWithoutDuration = LLMUsage.create(
        {
          userId: Option.some(UserId.create(new UUID(testUserId))),
          conversationId: Option.some(
            ConversationId.create(new UUID(testConversationId)),
          ),
          provider: providerResult.getValue(),
          model: modelResult.getValue(),
          inputTokens: inputTokensResult.getValue(),
          outputTokens: outputTokensResult.getValue(),
          cost: costResult.getValue(),
          requestDuration: Option.none(),
          promptKey: Option.none(),
        },
        new UUID(testId),
      );

      const persistence = llmUsageToPersistence(usageWithoutDuration);

      expect(persistence.requestDuration).toBeNull();
      expect(persistence.promptKey).toBeNull();
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve data through domain -> persistence -> domain", () => {
      const providerResult = ProviderIdentifier.create(
        testProvider as "openai" | "anthropic" | "google",
      );
      const modelResult = ModelIdentifier.create(testModel as string);
      const inputTokensResult = TokenCount.create(testInputTokens as number);
      const outputTokensResult = TokenCount.create(testOutputTokens as number);
      const costResult = Cost.create({
        amount: testCostAmount,
        currency: testCostCurrency,
      } as { amount: number; currency: string });
      const durationResult = Duration.create(testRequestDuration as number);

      const original = LLMUsage.create(
        {
          userId: Option.some(UserId.create(new UUID(testUserId))),
          conversationId: Option.some(
            ConversationId.create(new UUID(testConversationId)),
          ),
          provider: providerResult.getValue(),
          model: modelResult.getValue(),
          inputTokens: inputTokensResult.getValue(),
          outputTokens: outputTokensResult.getValue(),
          cost: costResult.getValue(),
          requestDuration: Option.some(durationResult.getValue()),
          promptKey: Option.some(testPromptKey),
        },
        new UUID(testId),
      );

      const persistence = llmUsageToPersistence(original);
      const domainResult = llmUsageToDomain(persistence);

      expect(domainResult.isSuccess).toBe(true);
      const restored = domainResult.getValue();
      expect(restored.id.value).toBe(original.id.value);
      expect(restored.get("provider").value).toBe(
        original.get("provider").value,
      );
      expect(restored.get("model").value).toBe(original.get("model").value);
      expect(restored.get("inputTokens").value).toBe(
        original.get("inputTokens").value,
      );
    });
  });
});
