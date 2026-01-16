import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { RollbackManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/rollback-managed-prompt.use-case";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { ManagedPromptId } from "@/domain/llm/prompt/managed-prompt-id";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import { PromptEnvironment } from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptKey } from "@/domain/llm/prompt/value-objects/prompt-key.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import {
  PromptVariable,
  type PromptVariableType,
  type PromptVariableValue,
} from "@/domain/llm/prompt/value-objects/prompt-variable.vo";

describe("RollbackManagedPromptUseCase", () => {
  let useCase: RollbackManagedPromptUseCase;
  let mockPromptRepository: IManagedPromptRepository;
  let mockEventDispatcher: IEventDispatcher;

  const testPromptId = new UUID<string>();

  const createMockPrompt = (
    key: string,
    version: number,
    id?: UUID<string>,
  ): ManagedPrompt => {
    const prompt = ManagedPrompt.create(
      {
        key: PromptKey.create(key as string).getValue(),
        name: PromptName.create("Test Prompt" as string).getValue(),
        description: Option.some(
          PromptDescription.create("A test prompt" as string).getValue(),
        ),
        template: PromptTemplate.create(
          `Version ${version} template` as string,
        ).getValue(),
        variables: [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
        environment: PromptEnvironment.create(
          "development" as "development" | "staging" | "production",
        ).getValue(),
        isActive: true,
      },
      id ?? new UUID<string>(),
    );
    return prompt;
  };

  const _createVersionHistory = (
    key: string,
    versions: number[],
  ): ManagedPrompt[] => {
    return versions.map((v) => {
      const prompt = createMockPrompt(key, v);
      // Simulate version increments
      for (let i = 1; i < v; i++) {
        prompt.updateContent(
          PromptTemplate.create(
            `Version ${i + 1} template` as string,
          ).getValue(),
          [
            PromptVariable.create({
              name: "name",
              type: "string" as PromptVariableType,
              required: true,
            } as PromptVariableValue).getValue(),
          ],
        );
      }
      return prompt;
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockPromptRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByKey: vi.fn(),
      findActiveByKey: vi.fn(),
      getVersionHistory: vi.fn(),
      activateVersion: vi.fn(),
    };

    mockEventDispatcher = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
      isSubscribed: vi.fn(),
      getHandlerCount: vi.fn(),
      clearHandlers: vi.fn(),
    };

    useCase = new RollbackManagedPromptUseCase(
      mockPromptRepository,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should rollback to specified version", async () => {
      const currentPrompt = createMockPrompt("test-prompt", 3, testPromptId);
      // Simulate current version is 3
      currentPrompt.updateContent(
        PromptTemplate.create("Version 2 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );
      currentPrompt.updateContent(
        PromptTemplate.create("Version 3 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(currentPrompt)),
      );
      vi.mocked(mockPromptRepository.activateVersion).mockResolvedValue(
        Result.ok(undefined),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 1,
      });

      expect(result.isSuccess).toBe(true);
      expect(mockPromptRepository.activateVersion).toHaveBeenCalledWith(
        expect.any(ManagedPromptId),
        1,
      );
    });

    it("should return rollback details", async () => {
      const currentPrompt = createMockPrompt("test-prompt", 3, testPromptId);
      currentPrompt.updateContent(
        PromptTemplate.create("Version 2 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );
      currentPrompt.updateContent(
        PromptTemplate.create("Version 3 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(currentPrompt)),
      );
      vi.mocked(mockPromptRepository.activateVersion).mockResolvedValue(
        Result.ok(undefined),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 2,
      });

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.id).toBe(testPromptId.value.toString());
      expect(output.key).toBe("test-prompt");
      expect(output.currentVersion).toBe(2);
      expect(output.rolledBackFrom).toBe(3);
      expect(output.updatedAt).toBeDefined();
    });

    it("should dispatch domain events after rollback", async () => {
      const currentPrompt = createMockPrompt("test-prompt", 2, testPromptId);
      currentPrompt.updateContent(
        PromptTemplate.create("Version 2 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(currentPrompt)),
      );
      vi.mocked(mockPromptRepository.activateVersion).mockResolvedValue(
        Result.ok(undefined),
      );

      await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 1,
      });

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalled();
    });
  });

  describe("prompt not found", () => {
    it("should fail when prompt does not exist", async () => {
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 1,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });
  });

  describe("version validation", () => {
    it("should fail when target version does not exist", async () => {
      const currentPrompt = createMockPrompt("test-prompt", 2, testPromptId);
      currentPrompt.updateContent(
        PromptTemplate.create("Version 2 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(currentPrompt)),
      );
      vi.mocked(mockPromptRepository.activateVersion).mockResolvedValue(
        Result.fail("Version 5 not found"),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 5,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Version");
    });

    it("should fail when rolling back to current version", async () => {
      const currentPrompt = createMockPrompt("test-prompt", 2, testPromptId);
      currentPrompt.updateContent(
        PromptTemplate.create("Version 2 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(currentPrompt)),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 2,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("already");
    });

    it("should fail when target version is negative", async () => {
      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: -1,
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when target version is zero", async () => {
      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 0,
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe("repository errors", () => {
    it("should propagate findById error", async () => {
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.fail("Database connection failed"),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 1,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database");
    });

    it("should propagate activateVersion error", async () => {
      const currentPrompt = createMockPrompt("test-prompt", 2, testPromptId);
      currentPrompt.updateContent(
        PromptTemplate.create("Version 2 template" as string).getValue(),
        [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(currentPrompt)),
      );
      vi.mocked(mockPromptRepository.activateVersion).mockResolvedValue(
        Result.fail("Rollback operation failed"),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        targetVersion: 1,
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Rollback");
    });
  });

  describe("input validation", () => {
    it("should fail when promptId is empty", async () => {
      const result = await useCase.execute({
        promptId: "",
        targetVersion: 1,
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when promptId is invalid UUID", async () => {
      const result = await useCase.execute({
        promptId: "not-a-uuid",
        targetVersion: 1,
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
