import { Option, Result, type UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGetManagedPromptInputDto } from "@/application/dto/llm/get-managed-prompt.dto";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { GetManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/get-managed-prompt.use-case";
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

describe("GetManagedPromptUseCase", () => {
  let useCase: GetManagedPromptUseCase;
  let mockPromptRepository: IManagedPromptRepository;

  const validInput: IGetManagedPromptInputDto = {
    key: "greeting-prompt",
    environment: "development",
  };

  const createMockPrompt = (
    key: string,
    environment: string,
    id?: UUID<string>,
  ): ManagedPrompt => {
    return ManagedPrompt.create(
      {
        key: PromptKey.create(key as string).getValue(),
        name: PromptName.create("Test Prompt" as string).getValue(),
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
        isActive: true,
      },
      id,
    );
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

    useCase = new GetManagedPromptUseCase(mockPromptRepository);
  });

  describe("happy path", () => {
    it("should return prompt when found by key and environment", async () => {
      const mockPrompt = createMockPrompt("greeting-prompt", "development");
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().key).toBe("greeting-prompt");
    });

    it("should return all prompt details", async () => {
      const mockPrompt = createMockPrompt("greeting-prompt", "development");
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.id).toBeDefined();
      expect(output.key).toBe("greeting-prompt");
      expect(output.name).toBe("Test Prompt");
      expect(output.description).toBe("A test prompt");
      expect(output.template).toBe("Hello {{name}}!");
      expect(output.variables).toHaveLength(1);
      expect(output.version).toBe(1);
      expect(output.isActive).toBe(true);
      expect(output.environment).toBe("development");
      expect(output.createdAt).toBeDefined();
    });

    it("should call repository with correct key and environment", async () => {
      const mockPrompt = createMockPrompt("greeting-prompt", "development");
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      await useCase.execute(validInput);

      expect(mockPromptRepository.findByKey).toHaveBeenCalledWith(
        "greeting-prompt",
        "development",
      );
    });

    it("should return null description when prompt has no description", async () => {
      const promptWithoutDescription = ManagedPrompt.create({
        key: PromptKey.create("no-desc-prompt" as string).getValue(),
        name: PromptName.create("No Desc Prompt" as string).getValue(),
        description: Option.none(),
        template: PromptTemplate.create("Hello!" as string).getValue(),
        variables: [],
        environment: PromptEnvironment.create(
          "development" as "development" | "staging" | "production",
        ).getValue(),
        isActive: true,
      });

      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(promptWithoutDescription)),
      );

      const result = await useCase.execute({
        key: "no-desc-prompt",
        environment: "development",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().description).toBeNull();
    });
  });

  describe("not found", () => {
    it("should return error when prompt not found", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });

    it("should return error when key exists in different environment", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        key: "greeting-prompt",
        environment: "production",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });
  });

  describe("environment handling", () => {
    it("should find prompt in development environment", async () => {
      const mockPrompt = createMockPrompt("test-prompt", "development");
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute({
        key: "test-prompt",
        environment: "development",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().environment).toBe("development");
    });

    it("should find prompt in staging environment", async () => {
      const mockPrompt = createMockPrompt("test-prompt", "staging");
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute({
        key: "test-prompt",
        environment: "staging",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().environment).toBe("staging");
    });

    it("should find prompt in production environment", async () => {
      const mockPrompt = createMockPrompt("test-prompt", "production");
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute({
        key: "test-prompt",
        environment: "production",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().environment).toBe("production");
    });
  });

  describe("repository errors", () => {
    it("should propagate repository error", async () => {
      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.fail("Database connection failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database");
    });
  });

  describe("variables mapping", () => {
    it("should map variable details correctly", async () => {
      const promptWithVariables = ManagedPrompt.create({
        key: PromptKey.create("vars-prompt" as string).getValue(),
        name: PromptName.create("Variables Prompt" as string).getValue(),
        description: Option.none(),
        template: PromptTemplate.create(
          "Hello {{name}}, your order {{orderId}} is ready!" as string,
        ).getValue(),
        variables: [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
          PromptVariable.create({
            name: "orderId",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
        ],
        environment: PromptEnvironment.create(
          "development" as "development" | "staging" | "production",
        ).getValue(),
        isActive: true,
      });

      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(promptWithVariables)),
      );

      const result = await useCase.execute({
        key: "vars-prompt",
        environment: "development",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().variables).toHaveLength(2);
      const firstVar = result.getValue().variables[0];
      expect(firstVar?.name).toBe("name");
      expect(firstVar?.type).toBe("string");
      expect(firstVar?.required).toBe(true);
    });

    it("should include default value in variable mapping", async () => {
      const promptWithDefault = ManagedPrompt.create({
        key: PromptKey.create("default-prompt" as string).getValue(),
        name: PromptName.create("Default Prompt" as string).getValue(),
        description: Option.none(),
        template: PromptTemplate.create(
          "Hello {{name}}, welcome to {{place}}!" as string,
        ).getValue(),
        variables: [
          PromptVariable.create({
            name: "name",
            type: "string" as PromptVariableType,
            required: true,
          } as PromptVariableValue).getValue(),
          PromptVariable.create({
            name: "place",
            type: "string" as PromptVariableType,
            required: false,
            defaultValue: "our platform",
          } as PromptVariableValue).getValue(),
        ],
        environment: PromptEnvironment.create(
          "development" as "development" | "staging" | "production",
        ).getValue(),
        isActive: true,
      });

      vi.mocked(mockPromptRepository.findByKey).mockResolvedValue(
        Result.ok(Option.some(promptWithDefault)),
      );

      const result = await useCase.execute({
        key: "default-prompt",
        environment: "development",
      });

      expect(result.isSuccess).toBe(true);
      const placeVar = result
        .getValue()
        .variables.find((v) => v.name === "place");
      expect(placeVar?.required).toBe(false);
      expect(placeVar?.defaultValue).toBe("our platform");
    });
  });
});
