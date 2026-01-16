import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IUpdateManagedPromptInputDto } from "@/application/dto/llm/update-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { UpdateManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/update-managed-prompt.use-case";
import { ManagedPromptUpdatedEvent } from "@/domain/llm/prompt/events/managed-prompt-updated.event";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import type { PromptEnvironmentType } from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptEnvironment } from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptKey } from "@/domain/llm/prompt/value-objects/prompt-key.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import {
  PromptVariable,
  type PromptVariableValue,
} from "@/domain/llm/prompt/value-objects/prompt-variable.vo";

describe("UpdateManagedPromptUseCase", () => {
  let useCase: UpdateManagedPromptUseCase;
  let mockPromptRepository: IManagedPromptRepository;
  let mockEventDispatcher: IEventDispatcher;

  const existingPromptId = new UUID<string>();

  const createExistingPrompt = (version = 1): ManagedPrompt => {
    const prompt = ManagedPrompt.reconstitute(
      {
        key: PromptKey.create("existing-prompt" as string).getValue(),
        name: PromptName.create("Existing Prompt" as string).getValue(),
        description: Option.some(
          PromptDescription.create("Original description" as string).getValue(),
        ),
        template: PromptTemplate.create(
          "Hello {{name}}, welcome!" as string,
        ).getValue(),
        variables: [
          PromptVariable.create({
            name: "name",
            type: "string",
            required: true,
          } as PromptVariableValue).getValue(),
        ],
        version,
        environment: PromptEnvironment.create(
          "development" as PromptEnvironmentType,
        ).getValue(),
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: Option.none(),
      },
      existingPromptId,
    );
    prompt.clearEvents();
    return prompt;
  };

  const validInput: IUpdateManagedPromptInputDto = {
    promptId: existingPromptId.value.toString(),
    name: "Updated Prompt Name",
    description: "Updated description for the prompt",
    template: "Hello {{name}}, welcome to {{location}}!",
    variables: [
      { name: "name", type: "string", required: true },
      {
        name: "location",
        type: "string",
        required: false,
        defaultValue: "the app",
      },
    ],
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

    useCase = new UpdateManagedPromptUseCase(
      mockPromptRepository,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should update the prompt successfully", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });

    it("should increment the version number", async () => {
      const existingPrompt = createExistingPrompt(1);
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(2);
    });

    it("should increment from any existing version", async () => {
      const existingPrompt = createExistingPrompt(5);
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(6);
    });

    it("should return the updated prompt id", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBe(existingPromptId.value.toString());
    });

    it("should return the prompt key", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().key).toBe("existing-prompt");
    });

    it("should return the updated name", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe("Updated Prompt Name");
    });

    it("should return updatedAt timestamp", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().updatedAt).toBeDefined();
      expect(() => new Date(result.getValue().updatedAt)).not.toThrow();
    });

    it("should call repository update", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      await useCase.execute(validInput);

      expect(mockPromptRepository.update).toHaveBeenCalledOnce();
    });
  });

  describe("partial updates", () => {
    it("should update only the name when only name provided", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        promptId: existingPromptId.value.toString(),
        name: "New Name Only",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe("New Name Only");
    });

    it("should update only template when only template provided", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        promptId: existingPromptId.value.toString(),
        template: "New template {{var}}",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(2);
    });

    it("should update only description when only description provided", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        promptId: existingPromptId.value.toString(),
        description: "New description only",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(2);
    });

    it("should update only variables when only variables provided", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        promptId: existingPromptId.value.toString(),
        variables: [{ name: "newVar", type: "string", required: false }],
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(2);
    });
  });

  describe("event dispatch", () => {
    it("should emit ManagedPromptUpdatedEvent", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      await useCase.execute(validInput);

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
      const dispatchedEvents = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0];
      expect(dispatchedEvents).toBeDefined();
      expect(dispatchedEvents).toHaveLength(1);
      expect(dispatchedEvents?.[0]).toBeInstanceOf(ManagedPromptUpdatedEvent);
    });

    it("should include previous version in event", async () => {
      const existingPrompt = createExistingPrompt(3);
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      await useCase.execute(validInput);

      const dispatchedEvents = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0];
      const event = dispatchedEvents?.[0] as ManagedPromptUpdatedEvent;
      expect(event.payload.previousVersion).toBe(3);
      expect(event.payload.newVersion).toBe(4);
    });

    it("should dispatch events after successful update", async () => {
      const callOrder: string[] = [];
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(async () => {
        callOrder.push("update");
        return Result.ok({} as ManagedPrompt);
      });
      vi.mocked(mockEventDispatcher.dispatchAll).mockImplementation(
        async () => {
          callOrder.push("dispatch");
          return Result.ok();
        },
      );

      await useCase.execute(validInput);

      expect(callOrder).toEqual(["update", "dispatch"]);
    });
  });

  describe("not found errors", () => {
    it("should fail when prompt not found", async () => {
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });

    it("should fail with invalid prompt id", async () => {
      const result = await useCase.execute({
        ...validInput,
        promptId: "invalid-uuid",
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("should fail when name is empty string", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );

      const result = await useCase.execute({
        ...validInput,
        name: "",
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when template is empty string", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );

      const result = await useCase.execute({
        ...validInput,
        template: "",
      });

      expect(result.isFailure).toBe(true);
    });
  });

  describe("repository errors", () => {
    it("should propagate findById error", async () => {
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.fail("Database connection failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database");
    });

    it("should propagate update error", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockResolvedValue(
        Result.fail("Failed to update prompt"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed");
    });

    it("should propagate event dispatch error", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(
        Result.fail("Event dispatch failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Event dispatch failed");
    });
  });

  describe("no changes", () => {
    it("should still increment version when no changes provided", async () => {
      const existingPrompt = createExistingPrompt();
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );
      vi.mocked(mockPromptRepository.update).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        promptId: existingPromptId.value.toString(),
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(2);
    });
  });
});
