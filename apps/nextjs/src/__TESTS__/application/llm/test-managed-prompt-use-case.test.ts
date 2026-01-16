import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ITestManagedPromptInputDto } from "@/application/dto/llm/test-managed-prompt.dto";
import type { ILLMProvider } from "@/application/ports/llm.provider.port";
import type { IManagedPromptRepository } from "@/application/ports/managed-prompt.repository.port";
import { TestManagedPromptUseCase } from "@/application/use-cases/llm/managed-prompts/test-managed-prompt.use-case";
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

describe("TestManagedPromptUseCase", () => {
  let useCase: TestManagedPromptUseCase;
  let mockPromptRepository: IManagedPromptRepository;
  let mockLLMProvider: ILLMProvider;

  const testPromptId = new UUID<string>();

  const createMockPrompt = (
    key: string,
    template: string,
    variables: Array<{
      name: string;
      required: boolean;
      defaultValue?: string;
    }>,
    id?: UUID<string>,
  ): ManagedPrompt => {
    return ManagedPrompt.create(
      {
        key: PromptKey.create(key as string).getValue(),
        name: PromptName.create("Test Prompt" as string).getValue(),
        description: Option.some(
          PromptDescription.create("A test prompt" as string).getValue(),
        ),
        template: PromptTemplate.create(template as string).getValue(),
        variables: variables.map((v) =>
          PromptVariable.create({
            name: v.name,
            type: "string" as PromptVariableType,
            required: v.required,
            defaultValue: v.defaultValue,
          } as PromptVariableValue).getValue(),
        ),
        environment: PromptEnvironment.create(
          "development" as "development" | "staging" | "production",
        ).getValue(),
        isActive: true,
      },
      id ?? new UUID<string>(),
    );
  };

  const mockLLMResponse = {
    content: "Hello, World! Nice to meet you.",
    model: "gpt-4",
    usage: {
      inputTokens: 10,
      outputTokens: 8,
      totalTokens: 18,
    },
    finishReason: "stop",
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

    mockLLMProvider = {
      generateText: vi.fn(),
      streamText: vi.fn(),
      estimateTokens: vi.fn(),
      getAvailableModels: vi.fn().mockReturnValue([
        {
          provider: "openai",
          model: "gpt-4",
          costPer1kIn: 0.03,
          costPer1kOut: 0.06,
          capabilities: ["text"],
          maxTokens: 8192,
          enabled: true,
        },
      ]),
    };

    useCase = new TestManagedPromptUseCase(
      mockPromptRepository,
      mockLLMProvider,
    );
  });

  describe("happy path", () => {
    it("should render prompt and call LLM provider", async () => {
      const mockPrompt = createMockPrompt(
        "greeting-prompt",
        "Hello {{name}}! Welcome to {{place}}.",
        [
          { name: "name", required: true },
          { name: "place", required: true },
        ],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const input: ITestManagedPromptInputDto = {
        promptId: testPromptId.value.toString(),
        variables: { name: "World", place: "our platform" },
      };

      const result = await useCase.execute(input);

      expect(result.isSuccess).toBe(true);
      expect(mockLLMProvider.generateText).toHaveBeenCalled();
    });

    it("should return rendered prompt in response", async () => {
      const mockPrompt = createMockPrompt(
        "greeting-prompt",
        "Hello {{name}}!",
        [{ name: "name", required: true }],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: { name: "Alice" },
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().renderedPrompt).toBe("Hello Alice!");
    });

    it("should return LLM response content", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Say hello",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().response).toBe(
        "Hello, World! Nice to meet you.",
      );
    });

    it("should return usage information", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().usage).toEqual({
        inputTokens: 10,
        outputTokens: 8,
        totalTokens: 18,
      });
    });

    it("should return cost information", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );
      vi.mocked(mockLLMProvider.getAvailableModels).mockReturnValue([
        {
          provider: "openai",
          model: "gpt-4",
          costPer1kIn: 0.03,
          costPer1kOut: 0.06,
          capabilities: ["text"],
          maxTokens: 8192,
          enabled: true,
        },
      ]);

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().cost).toBeDefined();
      expect(result.getValue().cost.currency).toBe("USD");
      expect(result.getValue().cost.amount).toBeGreaterThan(0);
    });

    it("should return model and provider info", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );
      vi.mocked(mockLLMProvider.getAvailableModels).mockReturnValue([
        {
          provider: "openai",
          model: "gpt-4",
          costPer1kIn: 0.03,
          costPer1kOut: 0.06,
          capabilities: ["text"],
          maxTokens: 8192,
          enabled: true,
        },
      ]);

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().model).toBe("gpt-4");
      expect(result.getValue().provider).toBeDefined();
    });
  });

  describe("custom provider and model", () => {
    it("should use specified provider", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok({
          ...mockLLMResponse,
          model: "claude-3-opus",
        }),
      );
      vi.mocked(mockLLMProvider.getAvailableModels).mockReturnValue([
        {
          provider: "anthropic",
          model: "claude-3-opus",
          costPer1kIn: 0.015,
          costPer1kOut: 0.075,
          capabilities: ["text"],
          maxTokens: 200000,
          enabled: true,
        },
      ]);

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
        provider: "anthropic",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().provider).toBe("anthropic");
    });

    it("should use specified model", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok({
          ...mockLLMResponse,
          model: "gpt-4-turbo",
        }),
      );
      vi.mocked(mockLLMProvider.getAvailableModels).mockReturnValue([
        {
          provider: "openai",
          model: "gpt-4-turbo",
          costPer1kIn: 0.01,
          costPer1kOut: 0.03,
          capabilities: ["text"],
          maxTokens: 128000,
          enabled: true,
        },
      ]);

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
        model: "gpt-4-turbo",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().model).toBe("gpt-4-turbo");
    });
  });

  describe("variable handling", () => {
    it("should render with all required variables", async () => {
      const mockPrompt = createMockPrompt(
        "multi-var-prompt",
        "Hello {{firstName}} {{lastName}}! Your order #{{orderId}} is ready.",
        [
          { name: "firstName", required: true },
          { name: "lastName", required: true },
          { name: "orderId", required: true },
        ],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {
          firstName: "John",
          lastName: "Doe",
          orderId: "12345",
        },
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().renderedPrompt).toBe(
        "Hello John Doe! Your order #12345 is ready.",
      );
    });

    it("should use default values for optional variables", async () => {
      const mockPrompt = createMockPrompt(
        "default-var-prompt",
        "Hello {{name}}! Welcome to {{place}}.",
        [
          { name: "name", required: true },
          { name: "place", required: false, defaultValue: "our platform" },
        ],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: { name: "Alice" },
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().renderedPrompt).toBe(
        "Hello Alice! Welcome to our platform.",
      );
    });

    it("should fail when required variable is missing", async () => {
      const mockPrompt = createMockPrompt(
        "required-var-prompt",
        "Hello {{name}}!",
        [{ name: "name", required: true }],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("name");
    });

    it("should allow override of default values", async () => {
      const mockPrompt = createMockPrompt(
        "override-prompt",
        "Welcome to {{place}}!",
        [{ name: "place", required: false, defaultValue: "our platform" }],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.ok(mockLLMResponse),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: { place: "Acme Corp" },
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().renderedPrompt).toBe("Welcome to Acme Corp!");
    });
  });

  describe("prompt not found", () => {
    it("should fail when prompt does not exist", async () => {
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("not found");
    });
  });

  describe("repository errors", () => {
    it("should propagate findById error", async () => {
      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.fail("Database connection failed"),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Database");
    });
  });

  describe("LLM provider errors", () => {
    it("should propagate LLM provider error", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );
      vi.mocked(mockLLMProvider.generateText).mockResolvedValue(
        Result.fail("Rate limit exceeded"),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Rate limit");
    });

    it("should fail when provider is unavailable", async () => {
      const mockPrompt = createMockPrompt(
        "test-prompt",
        "Test",
        [],
        testPromptId,
      );

      vi.mocked(mockPromptRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockPrompt)),
      );

      const result = await useCase.execute({
        promptId: testPromptId.value.toString(),
        variables: {},
        provider: "invalid-provider",
      });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain(
        "No enabled models found for provider",
      );
    });
  });

  describe("input validation", () => {
    it("should fail when promptId is empty", async () => {
      const result = await useCase.execute({
        promptId: "",
        variables: {},
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail when promptId is invalid UUID", async () => {
      const result = await useCase.execute({
        promptId: "not-a-uuid",
        variables: {},
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
