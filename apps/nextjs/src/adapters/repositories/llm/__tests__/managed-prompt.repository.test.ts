import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import { PromptEnvironment } from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptKey } from "@/domain/llm/prompt/value-objects/prompt-key.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import { PromptVariable } from "@/domain/llm/prompt/value-objects/prompt-variable.vo";
import { DrizzleManagedPromptRepository } from "../managed-prompt.repository";

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
  },
  eq: vi.fn(),
  and: vi.fn(),
  desc: vi.fn(),
}));

vi.mock("@packages/drizzle/schema", () => ({
  managedPrompt: {
    id: "id",
    key: "key",
    environment: "environment",
    isActive: "isActive",
  },
}));

describe("DrizzleManagedPromptRepository", () => {
  let repository: DrizzleManagedPromptRepository;
  const testId = "770e8400-e29b-41d4-a716-446655440002";
  const testKey = "welcome-email";
  const testEnvironment = "production";

  const createTestPrompt = (id?: string): ManagedPrompt => {
    const key = PromptKey.create(testKey as string).getValue();
    const name = PromptName.create("Welcome Email" as string).getValue();
    const description = PromptDescription.create(
      "Welcome email template" as string,
    ).getValue();
    const template = PromptTemplate.create(
      "Hello {{name}}, welcome to our platform!" as string,
    ).getValue();
    const environment = PromptEnvironment.create(
      testEnvironment as "production" | "staging" | "development",
    ).getValue();
    const variable = PromptVariable.create({
      name: "name",
      type: "string",
      required: true,
    }).getValue();

    return ManagedPrompt.create(
      {
        key,
        name,
        description: Option.some(description),
        template,
        variables: [variable],
        environment,
        isActive: true,
      },
      new UUID(id ?? testId),
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleManagedPromptRepository();
  });

  describe("create()", () => {
    it("should create a managed prompt and return Result.ok", async () => {
      const prompt = createTestPrompt();

      const result = await repository.create(prompt);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(prompt);
    });

    it("should return Result.fail when database error occurs", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      const prompt = createTestPrompt();
      const result = await repository.create(prompt);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to create");
    });
  });

  describe("update()", () => {
    it("should update a managed prompt and return Result.ok", async () => {
      const prompt = createTestPrompt();

      const result = await repository.update(prompt);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(prompt);
    });

    it("should return Result.fail when update fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error("Update error");
      });

      const prompt = createTestPrompt();
      const result = await repository.update(prompt);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to update");
    });
  });

  describe("delete()", () => {
    it("should delete a managed prompt and return Result.ok with id", async () => {
      const promptId = ManagedPromptId.create(new UUID(testId));

      const result = await repository.delete(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(testId);
    });

    it("should return Result.fail when delete fails", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.delete).mockImplementationOnce(() => {
        throw new Error("Delete error");
      });

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.delete(promptId);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed to delete");
    });
  });

  describe("findById()", () => {
    it("should return Option.some when prompt exists", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecord = {
        id: testId,
        key: testKey,
        name: "Welcome Email",
        description: "Welcome email template",
        template: "Hello {{name}}",
        variables: [{ name: "name", type: "string", required: true }],
        version: 1,
        environment: testEnvironment as "production",
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.findById(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
      const prompt = result.getValue().unwrap();
      expect(prompt.id.value).toBe(testId);
    });

    it("should return Option.none when prompt does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.findById(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe("findByKey()", () => {
    it("should return Option.some when prompt with key exists", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecord = {
        id: testId,
        key: testKey,
        name: "Welcome Email",
        description: null,
        template: "Hello {{name}}",
        variables: [],
        version: 1,
        environment: testEnvironment as "production",
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findByKey(testKey, testEnvironment);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
    });

    it("should return Option.none when prompt with key does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findByKey(
        "non-existent",
        testEnvironment,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe("findActiveByKey()", () => {
    it("should return Option.some when active prompt exists", async () => {
      const { db } = await import("@packages/drizzle");
      const mockRecord = {
        id: testId,
        key: testKey,
        name: "Welcome Email",
        description: null,
        template: "Hello {{name}}",
        variables: [],
        version: 1,
        environment: testEnvironment as "production",
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findActiveByKey(testKey, testEnvironment);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isSome()).toBe(true);
    });

    it("should return Option.none when no active prompt", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.findActiveByKey(testKey, testEnvironment);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isNone()).toBe(true);
    });
  });

  describe("getVersionHistory()", () => {
    it("should return list of prompt versions ordered by version desc", async () => {
      const { db } = await import("@packages/drizzle");
      const baseRecord = {
        id: testId,
        key: testKey,
        name: "Welcome Email",
        description: null,
        template: "Hello {{name}}",
        variables: [],
        version: 1,
        environment: testEnvironment as "production",
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      };
      const mockRecords = [
        {
          id: "id-v3",
          key: testKey,
          name: "Welcome Email",
          description: null,
          template: "Hello {{name}} v3",
          variables: [],
          version: 3,
          environment: testEnvironment as "production",
          isActive: true,
          createdAt: new Date(),
          updatedAt: null,
        },
        {
          id: "id-v2",
          key: testKey,
          name: "Welcome Email",
          description: null,
          template: "Hello {{name}} v2",
          variables: [],
          version: 2,
          environment: testEnvironment as "production",
          isActive: false,
          createdAt: new Date(),
          updatedAt: null,
        },
      ];

      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([baseRecord]),
            }),
          }),
        } as unknown as ReturnType<typeof db.select>)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockRecords),
            }),
          }),
        } as unknown as ReturnType<typeof db.select>);

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.getVersionHistory(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(2);
    });

    it("should return empty array when no versions found", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.getVersionHistory(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().length).toBe(0);
    });
  });

  describe("activateVersion()", () => {
    it("should activate specified version and deactivate others", async () => {
      const { db } = await import("@packages/drizzle");
      const baseRecord = {
        id: testId,
        key: testKey,
        name: "Welcome Email",
        description: null,
        template: "Hello {{name}}",
        variables: [],
        version: 1,
        environment: testEnvironment as "production",
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([baseRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.activateVersion(
        ManagedPromptId.create(new UUID(testId)),
        2,
      );

      expect(result.isSuccess).toBe(true);
    });

    it("should return Result.fail when activation fails", async () => {
      const { db } = await import("@packages/drizzle");
      const baseRecord = {
        id: testId,
        key: testKey,
        name: "Welcome Email",
        description: null,
        template: "Hello {{name}}",
        variables: [],
        version: 1,
        environment: testEnvironment as "production",
        isActive: true,
        createdAt: new Date(),
        updatedAt: null,
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([baseRecord]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error("Update error");
      });

      const result = await repository.activateVersion(
        ManagedPromptId.create(new UUID(testId)),
        2,
      );

      expect(result.isFailure).toBe(true);
    });
  });

  describe("findAll()", () => {
    it("should return paginated list of all prompts", async () => {
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
    it("should return true when prompt exists", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: testId }]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.exists(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it("should return false when prompt does not exist", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as unknown as ReturnType<typeof db.select>);

      const promptId = ManagedPromptId.create(new UUID(testId));
      const result = await repository.exists(promptId);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(false);
    });
  });

  describe("count()", () => {
    it("should return total count of prompts", async () => {
      const { db } = await import("@packages/drizzle");
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockResolvedValue([{}, {}, {}]),
      } as unknown as ReturnType<typeof db.select>);

      const result = await repository.count();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(3);
    });
  });
});
