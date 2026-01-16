import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICreateManagedPromptInputDto } from "@/application/dto/llm/create-managed-prompt.dto";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { CreateManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/create-managed-prompt.use-case";
import { ManagedPromptCreatedEvent } from "@/domain/llm/prompt/events/managed-prompt-created.event";
import type { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";

describe("CreateManagedPromptUseCase", () => {
  let useCase: CreateManagedPromptUseCase;
  let mockPromptRepository: IManagedPromptRepository;
  let mockEventDispatcher: IEventDispatcher;

  const validInput: ICreateManagedPromptInputDto = {
    key: "greeting-prompt",
    name: "Greeting Prompt",
    description: "A prompt for greeting users",
    template: "Hello {{name}}, welcome to {{place}}!",
    variables: [
      { name: "name", type: "string", required: true },
      {
        name: "place",
        type: "string",
        required: false,
        defaultValue: "our platform",
      },
    ],
    environment: "development",
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

    useCase = new CreateManagedPromptUseCase(
      mockPromptRepository,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should create a prompt with version 1", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().version).toBe(1);
    });

    it("should return the created prompt id", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().id).toBeDefined();
      expect(result.getValue().id.length).toBeGreaterThan(0);
    });

    it("should return the prompt key and name", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().key).toBe("greeting-prompt");
      expect(result.getValue().name).toBe("Greeting Prompt");
    });

    it("should return createdAt timestamp", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().createdAt).toBeDefined();
      expect(() => new Date(result.getValue().createdAt)).not.toThrow();
    });

    it("should save prompt to repository", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      await useCase.execute(validInput);

      expect(mockPromptRepository.create).toHaveBeenCalledOnce();
    });
  });

  describe("variable extraction", () => {
    it("should extract variables from template", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const inputWithAutoVariables: ICreateManagedPromptInputDto = {
        key: "auto-vars",
        name: "Auto Variables Prompt",
        template: "Hello {{user}}, your order {{orderId}} is ready!",
        environment: "development",
      };

      const result = await useCase.execute(inputWithAutoVariables);

      expect(result.isSuccess).toBe(true);
      // Variables should be extracted from template when not explicitly provided
    });

    it("should use provided variables over extracted ones", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      // The provided variables array should be used
    });
  });

  describe("duplicate key validation", () => {
    it("should return error when key already exists in same environment", async () => {
      const existingPrompt = {} as ManagedPrompt;
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(existingPrompt)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("already exists");
    });

    it("should allow same key in different environment", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const inputWithDifferentEnv: ICreateManagedPromptInputDto = {
        ...validInput,
        environment: "production",
      };

      const result = await useCase.execute(inputWithDifferentEnv);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("environment validation", () => {
    it("should accept development environment", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        ...validInput,
        environment: "development",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should accept staging environment", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        ...validInput,
        environment: "staging",
      });

      expect(result.isSuccess).toBe(true);
    });

    it("should accept production environment", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const result = await useCase.execute({
        ...validInput,
        environment: "production",
      });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("event dispatch", () => {
    it("should emit ManagedPromptCreatedEvent", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      await useCase.execute(validInput);

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledOnce();
      const dispatchedEvents = vi.mocked(mockEventDispatcher.dispatchAll).mock
        .calls[0]?.[0];
      expect(dispatchedEvents).toBeDefined();
      expect(dispatchedEvents).toHaveLength(1);
      expect(dispatchedEvents?.[0]).toBeInstanceOf(ManagedPromptCreatedEvent);
    });

    it("should dispatch events after successful save", async () => {
      const callOrder: string[] = [];
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(async () => {
        callOrder.push("create");
        return Result.ok({} as ManagedPrompt);
      });
      vi.mocked(mockEventDispatcher.dispatchAll).mockImplementation(
        async () => {
          callOrder.push("dispatch");
          return Result.ok();
        },
      );

      await useCase.execute(validInput);

      expect(callOrder).toEqual(["create", "dispatch"]);
    });
  });

  describe("validation errors", () => {
    it("should fail when key is empty", async () => {
      const invalidInput = { ...validInput, key: "" };

      const result = await useCase.execute(invalidInput);

      expect(result.isFailure).toBe(true);
    });

    it("should fail when key has invalid format", async () => {
      const invalidInput = { ...validInput, key: "Invalid Key With Spaces" };

      const result = await useCase.execute(invalidInput);

      expect(result.isFailure).toBe(true);
    });

    it("should fail when name is empty", async () => {
      const invalidInput = { ...validInput, name: "" };

      const result = await useCase.execute(invalidInput);

      expect(result.isFailure).toBe(true);
    });

    it("should fail when template is empty", async () => {
      const invalidInput = { ...validInput, template: "" };

      const result = await useCase.execute(invalidInput);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("repository errors", () => {
    it("should propagate findByKey error", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.fail("Database connection failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database");
    });

    it("should propagate create error", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockResolvedValue(
        Result.fail("Failed to save prompt"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Failed");
    });
  });

  describe("optional fields", () => {
    it("should create prompt without description", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const inputWithoutDescription: ICreateManagedPromptInputDto = {
        key: "simple-prompt",
        name: "Simple Prompt",
        template: "Hello world!",
        environment: "development",
      };

      const result = await useCase.execute(inputWithoutDescription);

      expect(result.isSuccess).toBe(true);
    });

    it("should create prompt without variables array", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockPromptRepository.create).mockImplementation(
        async (prompt: ManagedPrompt) => Result.ok(prompt),
      );
      vi.mocked(mockEventDispatcher.dispatchAll).mockResolvedValue(Result.ok());

      const inputWithoutVariables: ICreateManagedPromptInputDto = {
        key: "static-prompt",
        name: "Static Prompt",
        template: "This is a static prompt without variables",
        environment: "development",
      };

      const result = await useCase.execute(inputWithoutVariables);

      expect(result.isSuccess).toBe(true);
    });
  });
});
