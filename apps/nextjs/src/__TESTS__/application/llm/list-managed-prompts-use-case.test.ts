import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IListManagedPromptsInputDto } from "@/application/dto/llm/list-managed-prompts.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { ListManagedPromptsUseCase } from "@/application/use-cases/llm/managed-prompts/list-managed-prompts.use-case";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
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

describe("ListManagedPromptsUseCase", () => {
  let useCase: ListManagedPromptsUseCase;
  let mockPromptRepository: IManagedPromptRepository;

  const createMockPrompt = (
    key: string,
    name: string,
    environment: string,
    isActive = true,
  ): ManagedPrompt => {
    return ManagedPrompt.create({
      key: PromptKey.create(key as string).getValue(),
      name: PromptName.create(name as string).getValue(),
      description: Option.some(
        PromptDescription.create("A test prompt" as string).getValue(),
      ),
      template: PromptTemplate.create("Hello {{name}}!" as string).getValue(),
      variables: [
        PromptVariable.create({
          name: "name",
          type: "string" as PromptVariableType,
          required: true,
        } as PromptVariableValue).getValue(),
      ],
      environment: PromptEnvironment.create(
        environment as "development" | "staging" | "production",
      ).getValue(),
      isActive,
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

    useCase = new ListManagedPromptsUseCase(mockPromptRepository);
  });

  describe("happy path", () => {
    it("should return list of prompts", async () => {
      const mockPrompts = [
        createMockPrompt("prompt-one", "Prompt One", "development"),
        createMockPrompt("prompt-two", "Prompt Two", "development"),
      ];

      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: mockPrompts,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().prompts).toHaveLength(2);
    });

    it("should return prompt summary information", async () => {
      const mockPrompt = createMockPrompt(
        "greeting-prompt",
        "Greeting Prompt",
        "development",
      );

      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [mockPrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      const prompt = result.getValue().prompts[0];
      expect(prompt).toBeDefined();
      expect(prompt?.id).toBeDefined();
      expect(prompt?.key).toBe("greeting-prompt");
      expect(prompt?.name).toBe("Greeting Prompt");
      expect(prompt?.description).toBe("A test prompt");
      expect(prompt?.version).toBe(1);
      expect(prompt?.isActive).toBe(true);
      expect(prompt?.environment).toBe("development");
      expect(prompt?.createdAt).toBeDefined();
    });

    it("should return empty list when no prompts exist", async () => {
      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().prompts).toHaveLength(0);
    });
  });

  describe("pagination", () => {
    it("should return pagination info", async () => {
      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 50,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().pagination).toEqual({
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      });
    });

    it("should use provided pagination params", async () => {
      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: true,
          },
        }),
      );

      const input: IListManagedPromptsInputDto = {
        pagination: { page: 2, limit: 10 },
      };

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().pagination.page).toBe(2);
      expect(result.getValue().pagination.limit).toBe(10);
    });

    it("should use default pagination when not provided", async () => {
      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      await useCase.execute({});

      expect(mockPromptRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });
  });

  describe("environment filtering", () => {
    it("should filter by development environment", async () => {
      const devPrompt = createMockPrompt(
        "dev-prompt",
        "Dev Prompt",
        "development",
      );

      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.ok({
          data: [devPrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({ environment: "development" });

      expect(result.isSuccess).toBe(true);
      expect(mockPromptRepository.findMany).toHaveBeenCalled();
    });

    it("should filter by production environment", async () => {
      const prodPrompt = createMockPrompt(
        "prod-prompt",
        "Prod Prompt",
        "production",
      );

      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.ok({
          data: [prodPrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({ environment: "production" });

      expect(result.isSuccess).toBe(true);
    });

    it("should return all environments when no filter provided", async () => {
      const prompts = [
        createMockPrompt("dev-prompt", "Dev Prompt", "development"),
        createMockPrompt("prod-prompt", "Prod Prompt", "production"),
      ];

      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: prompts,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().prompts).toHaveLength(2);
    });
  });

  describe("search filtering", () => {
    it("should filter by search term in key", async () => {
      const matchingPrompt = createMockPrompt(
        "greeting-prompt",
        "Greeting Prompt",
        "development",
      );

      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.ok({
          data: [matchingPrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({ search: "greeting" });

      expect(result.isSuccess).toBe(true);
    });

    it("should filter by search term in name", async () => {
      const matchingPrompt = createMockPrompt(
        "welcome-prompt",
        "Welcome Message",
        "development",
      );

      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.ok({
          data: [matchingPrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({ search: "Welcome" });

      expect(result.isSuccess).toBe(true);
    });

    it("should return empty when no prompts match search", async () => {
      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.ok({
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({ search: "nonexistent" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().prompts).toHaveLength(0);
    });
  });

  describe("combined filtering", () => {
    it("should combine environment and search filters", async () => {
      const matchingPrompt = createMockPrompt(
        "prod-greeting",
        "Production Greeting",
        "production",
      );

      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.ok({
          data: [matchingPrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({
        environment: "production",
        search: "greeting",
      });

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("repository errors", () => {
    it("should propagate findAll error", async () => {
      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.fail("Database connection failed"),
      );

      const result = await useCase.execute({});

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database");
    });

    it("should propagate findMany error", async () => {
      vi.mocked(mockPromptRepository.findMany).mockResolvedValue(
        Result.fail("Query execution failed"),
      );

      const result = await useCase.execute({ environment: "development" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Query");
    });
  });

  describe("null description handling", () => {
    it("should return null for prompts without description", async () => {
      const promptWithoutDescription = ManagedPrompt.create({
        key: PromptKey.create("no-desc" as string).getValue(),
        name: PromptName.create("No Description" as string).getValue(),
        description: Option.none(),
        template: PromptTemplate.create("Hello!" as string).getValue(),
        variables: [],
        environment: PromptEnvironment.create(
          "development" as "development" | "staging" | "production",
        ).getValue(),
        isActive: true,
      });

      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [promptWithoutDescription],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().prompts[0]?.description).toBeNull();
    });
  });

  describe("isActive handling", () => {
    it("should include inactive prompts in list", async () => {
      const inactivePrompt = createMockPrompt(
        "inactive-prompt",
        "Inactive Prompt",
        "development",
        false,
      );

      vi.mocked(mockPromptRepository.findAll).mockResolvedValue(
        Result.ok({
          data: [inactivePrompt],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      );

      const result = await useCase.execute({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().prompts[0]?.isActive).toBe(false);
    });
  });
});
