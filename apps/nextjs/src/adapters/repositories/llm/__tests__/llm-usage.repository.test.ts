import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Cost } from "@/domain/llm/conversation/value-objects/cost.vo";
import { LLMUsage } from "@/domain/llm/usage/llm-usage.aggregate";
import { LLMUsageId } from "@/domain/llm/usage/llm-usage-id";
import { Duration } from "@/domain/llm/usage/value-objects/duration.vo";
import { ModelIdentifier } from "@/domain/llm/usage/value-objects/model-identifier.vo";
import { ProviderIdentifier } from "@/domain/llm/usage/value-objects/provider-identifier.vo";
import { TokenCount } from "@/domain/llm/usage/value-objects/token-count.vo";
import { DrizzleLLMUsageRepository } from "../llm-usage.repository";

vi.mock("@packages/drizzle", () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    groupBy: vi.fn().mockReturnThis(),
  },
  eq: vi.fn(),
  and: vi.fn(),
  gte: vi.fn(),
  lt: vi.fn(),
  sum: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@packages/drizzle/schema", () => ({
  llmUsage: {
    id: "id",
    userId: "userId",
    createdAt: "createdAt",
    costAmount: "costAmount",
    inputTokens: "inputTokens",
    outputTokens: "outputTokens",
    provider: "provider",
    model: "model",
  },
}));

describe("DrizzleLLMUsageRepository", () => {
  let repository: DrizzleLLMUsageRepository;
  const testId = "880e8400-e29b-41d4-a716-446655440003";
  const testUserId = "user-123";

  const createTestUsage = (id?: string): LLMUsage => {
    const provider = ProviderIdentifier.create(
      "anthropic" as "openai" | "anthropic" | "google",
    ).getValue();
    const model = ModelIdentifier.create("claude-3-opus" as string).getValue();
    const inputTokens = TokenCount.create(100 as number).getValue();
    const outputTokens = TokenCount.create(200 as number).getValue();
    const cost = Cost.create({
      amount: 0.05,
      currency: "USD" as string,
    }).getValue();
    const duration = Duration.create(1500 as number).getValue();

    return LLMUsage.create(
      {
        userId: Option.some(testUserId),
        conversationId: Option.none(),
        provider,
        model,
        inputTokens,
        outputTokens,
        cost,
        requestDuration: Option.some(duration),
        promptKey: Option.none(),
      },
      new UUID(id ?? testId),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleLLMUsageRepository();
  });

  describe("create()", () => {
    it("should create a usage record and return Result.ok", async () => {
      const usage = createTestUsage();

      const result = await repository.create(usage);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(usage);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const usage = createTestUsage();
      const result = await repository.create(usage);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to create");
    });
  });

  describe("update()", () => {
    it("should update a usage record and return Result.ok", async () => {
      const usage = createTestUsage();

      const result = await repository.update(usage);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(usage);
    });

    it("should return Result.fail when update fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error("Update error");
      });

      const usage = createTestUsage();
      const result = await repository.update(usage);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to update");
    });
  });

  describe("delete()", () => {
    it("should delete a usage record and return Result.ok with id", async () => {
      const usageId = LLMUsageId.create(new UUID(testId));

      const result = await repository.delete(usageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(testId);
    });

    it("should return Result.fail when delete fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error("Delete error");
      });

      const usageId = LLMUsageId.create(new UUID(testId));
      const result = await repository.delete(usageId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to delete");
    });
  });

  describe("findById()", () => {
    it("should return Option.some when usage record exists", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecord = {
        id: testId,
        userId: testUserId,
        conversationId: null,
        provider: "anthropic" as const,
        model: "claude-3-opus",
        inputTokens: 100,
        outputTokens: 200,
        costAmount: 0.05,
        costCurrency: "USD",
        requestDuration: 1500,
        promptKey: null,
        createdAt: new Date(),
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const usageId = LLMUsageId.create(new UUID(testId));
      const result = await repository.findById(usageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
      const usage = result.getValue().unwrap();
      expect(usage.id.value).toBe(testId);
    });

    it("should return Option.none when usage record does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const usageId = LLMUsageId.create(new UUID(testId));
      const result = await repository.findById(usageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe("getTotalCostByUser()", () => {
    it("should return total cost for user in day period", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 1.5 }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getTotalCostByUser(testUserId, "day");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(1.5);
    });

    it("should return total cost for user in month period", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 25.0 }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getTotalCostByUser(testUserId, "month");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(25.0);
    });

    it("should return 0 when no usage found", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: null }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getTotalCostByUser(testUserId, "day");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(0);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const result = await repository.getTotalCostByUser(testUserId, "day");

      expect(result.isFailure).toBe(true);
    });
  });

  describe("getTotalCostGlobal()", () => {
    it("should return global total cost for day period", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 150.0 }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getTotalCostGlobal("day");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(150.0);
    });

    it("should return global total cost for month period", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: 3500.0 }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getTotalCostGlobal("month");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(3500.0);
    });

    it("should return 0 when no usage found", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ total: null }]),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getTotalCostGlobal("day");

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(0);
    });
  });

  describe("getUsageStats()", () => {
    it("should return usage stats with breakdown by provider", async () => {
      const { db } = await import("@packages/drizzle");
      const mockBreakdown = [
        {
          provider: "anthropic",
          cost: 50.0,
          tokens: 10000,
          requests: 100,
        },
        {
          provider: "openai",
          cost: 30.0,
          tokens: 8000,
          requests: 80,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(mockBreakdown),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getUsageStats({
        groupBy: "provider",
      });

      expect(result.isSuccess).toBe(true);
      const stats = result.getValue();
      expect(stats.breakdown.length).toBe(2);
    });

    it("should return usage stats with breakdown by model", async () => {
      const { db } = await import("@packages/drizzle");
      const mockBreakdown = [
        {
          model: "claude-3-opus",
          cost: 40.0,
          tokens: 5000,
          requests: 50,
        },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue(mockBreakdown),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getUsageStats({
        groupBy: "model",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should filter stats by userId", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getUsageStats({
        userId: testUserId,
        groupBy: "provider",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should filter stats by date range", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            groupBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.getUsageStats({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        groupBy: "day",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const result = await repository.getUsageStats({
        groupBy: "provider",
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe("findAll()", () => {
    it("should return paginated list of all usage records", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findAll({ page: 1, limit: 10 });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("exists()", () => {
    it("should return true when usage record exists", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testId }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const usageId = LLMUsageId.create(new UUID(testId));
      const result = await repository.exists(usageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it("should return false when usage record does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const usageId = LLMUsageId.create(new UUID(testId));
      const result = await repository.exists(usageId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });
  });

  describe("count()", () => {
    it("should return total count of usage records", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockResolvedValue([{}, {}, {}, {}]),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.count();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(4);
    });
  });
});
