import { Option, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it } from "vitest";
import { ManagedPrompt } from "@/domain/llm/prompt/managed-prompt.aggregate";
import { PromptDescription } from "@/domain/llm/prompt/value-objects/prompt-description.vo";
import { PromptEnvironment } from "@/domain/llm/prompt/value-objects/prompt-environment.vo";
import { PromptKey } from "@/domain/llm/prompt/value-objects/prompt-key.vo";
import { PromptName } from "@/domain/llm/prompt/value-objects/prompt-name.vo";
import { PromptTemplate } from "@/domain/llm/prompt/value-objects/prompt-template.vo";
import { PromptVariable } from "@/domain/llm/prompt/value-objects/prompt-variable.vo";
import {
  managedPromptToDomain,
  managedPromptToPersistence,
} from "../managed-prompt.mapper";

describe("ManagedPromptMapper", () => {
  const testId = "550e8400-e29b-41d4-a716-446655440002";
  const testKey = "welcome-email";
  const testName = "Welcome Email Prompt";
  const testDescription = "A prompt for welcome emails";
  const testTemplate = "Hello {{name}}, welcome to our platform!";
  const testVariables = [
    { name: "name", type: "string" as const, required: true },
  ];
  const testVersion = 1;
  const testEnvironment = "development" as const;
  const testCreatedAt = new Date("2024-01-01T00:00:00Z");
  const testUpdatedAt = new Date("2024-01-02T00:00:00Z");

  describe("managedPromptToDomain()", () => {
    describe("happy path", () => {
      it("should convert a DB record to domain ManagedPrompt", () => {
        const record = {
          id: testId,
          key: testKey,
          name: testName,
          description: testDescription,
          template: testTemplate,
          variables: testVariables,
          version: testVersion,
          environment: testEnvironment,
          isActive: true,
          createdAt: testCreatedAt,
          updatedAt: testUpdatedAt,
        };

        const result = managedPromptToDomain(record);

        expect(result.isSuccess).toBe(true);
        const prompt = result.getValue();
        expect(prompt.id.value).toBe(testId);
        expect(prompt.get("key").value).toBe(testKey);
        expect(prompt.get("name").value).toBe(testName);
        expect(prompt.get("description").isSome()).toBe(true);
        expect(prompt.get("template").value).toBe(testTemplate);
        expect(prompt.get("variables")).toHaveLength(1);
        expect(prompt.get("version")).toBe(testVersion);
        expect(prompt.get("environment").value).toBe(testEnvironment);
        expect(prompt.get("isActive")).toBe(true);
      });

      it("should handle null description as Option.none()", () => {
        const record = {
          id: testId,
          key: testKey,
          name: testName,
          description: null,
          template: testTemplate,
          variables: [],
          version: testVersion,
          environment: testEnvironment,
          isActive: true,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = managedPromptToDomain(record);

        expect(result.isSuccess).toBe(true);
        const prompt = result.getValue();
        expect(prompt.get("description").isNone()).toBe(true);
      });

      it("should handle null updatedAt as Option.none()", () => {
        const record = {
          id: testId,
          key: testKey,
          name: testName,
          description: testDescription,
          template: testTemplate,
          variables: testVariables,
          version: testVersion,
          environment: testEnvironment,
          isActive: true,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = managedPromptToDomain(record);

        expect(result.isSuccess).toBe(true);
        const prompt = result.getValue();
        expect(prompt.get("updatedAt").isNone()).toBe(true);
      });

      it("should handle empty variables array", () => {
        const record = {
          id: testId,
          key: testKey,
          name: testName,
          description: null,
          template: "No variables here",
          variables: [],
          version: testVersion,
          environment: testEnvironment,
          isActive: false,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = managedPromptToDomain(record);

        expect(result.isSuccess).toBe(true);
        const prompt = result.getValue();
        expect(prompt.get("variables")).toHaveLength(0);
      });

      it("should handle variables with default values", () => {
        const variablesWithDefault = [
          {
            name: "greeting",
            type: "string" as const,
            required: false,
            defaultValue: "Hello",
          },
        ];
        const record = {
          id: testId,
          key: testKey,
          name: testName,
          description: null,
          template: "{{greeting}}, world!",
          variables: variablesWithDefault,
          version: testVersion,
          environment: testEnvironment,
          isActive: true,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = managedPromptToDomain(record);

        expect(result.isSuccess).toBe(true);
        const prompt = result.getValue();
        expect(prompt.get("variables")[0]?.defaultValue).toBe("Hello");
      });
    });

    describe("error handling", () => {
      it("should fail when key is invalid", () => {
        const record = {
          id: testId,
          key: "INVALID_KEY",
          name: testName,
          description: null,
          template: testTemplate,
          variables: [],
          version: testVersion,
          environment: testEnvironment,
          isActive: true,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = managedPromptToDomain(record);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("key");
      });

      it("should fail when template is empty", () => {
        const record = {
          id: testId,
          key: testKey,
          name: testName,
          description: null,
          template: "",
          variables: [],
          version: testVersion,
          environment: testEnvironment,
          isActive: true,
          createdAt: testCreatedAt,
          updatedAt: null,
        };

        const result = managedPromptToDomain(record);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toContain("template");
      });
    });
  });

  describe("managedPromptToPersistence()", () => {
    let prompt: ManagedPrompt;

    beforeEach(() => {
      const keyResult = PromptKey.create(testKey as string);
      const nameResult = PromptName.create(testName as string);
      const descriptionResult = PromptDescription.create(
        testDescription as string,
      );
      const templateResult = PromptTemplate.create(testTemplate as string);
      const environmentResult = PromptEnvironment.create(
        testEnvironment as "development" | "staging" | "production",
      );
      const variableResult = PromptVariable.create(
        testVariables[0] as {
          name: string;
          type: "string" | "number" | "boolean";
          required: boolean;
          defaultValue?: string;
        },
      );

      prompt = ManagedPrompt.create(
        {
          key: keyResult.getValue(),
          name: nameResult.getValue(),
          description: Option.some(descriptionResult.getValue()),
          template: templateResult.getValue(),
          variables: [variableResult.getValue()],
          environment: environmentResult.getValue(),
          isActive: true,
        },
        new UUID(testId),
      );
    });

    it("should convert domain ManagedPrompt to persistence format", () => {
      const persistence = managedPromptToPersistence(prompt);

      expect(persistence.id).toBe(testId);
      expect(persistence.key).toBe(testKey);
      expect(persistence.name).toBe(testName);
      expect(persistence.description).toBe(testDescription);
      expect(persistence.template).toBe(testTemplate);
      expect(persistence.variables).toHaveLength(1);
      expect(persistence.version).toBe(1);
      expect(persistence.environment).toBe(testEnvironment);
      expect(persistence.isActive).toBe(true);
    });

    it("should convert Option.none() description to null", () => {
      const keyResult = PromptKey.create(testKey as string);
      const nameResult = PromptName.create(testName as string);
      const templateResult = PromptTemplate.create(testTemplate as string);
      const environmentResult = PromptEnvironment.create(
        testEnvironment as "development" | "staging" | "production",
      );

      const promptWithoutDescription = ManagedPrompt.create(
        {
          key: keyResult.getValue(),
          name: nameResult.getValue(),
          description: Option.none(),
          template: templateResult.getValue(),
          variables: [],
          environment: environmentResult.getValue(),
          isActive: true,
        },
        new UUID(testId),
      );

      const persistence = managedPromptToPersistence(promptWithoutDescription);

      expect(persistence.description).toBeNull();
    });

    it("should serialize variables as JSON-compatible array", () => {
      const persistence = managedPromptToPersistence(prompt);

      expect(Array.isArray(persistence.variables)).toBe(true);
      expect(persistence.variables[0]).toHaveProperty("name", "name");
      expect(persistence.variables[0]).toHaveProperty("type", "string");
      expect(persistence.variables[0]).toHaveProperty("required", true);
    });
  });

  describe("round-trip conversion", () => {
    it("should preserve data through domain -> persistence -> domain", () => {
      const keyResult = PromptKey.create(testKey as string);
      const nameResult = PromptName.create(testName as string);
      const descriptionResult = PromptDescription.create(
        testDescription as string,
      );
      const templateResult = PromptTemplate.create(testTemplate as string);
      const environmentResult = PromptEnvironment.create(
        testEnvironment as "development" | "staging" | "production",
      );
      const variableResult = PromptVariable.create(
        testVariables[0] as {
          name: string;
          type: "string" | "number" | "boolean";
          required: boolean;
          defaultValue?: string;
        },
      );

      const original = ManagedPrompt.create(
        {
          key: keyResult.getValue(),
          name: nameResult.getValue(),
          description: Option.some(descriptionResult.getValue()),
          template: templateResult.getValue(),
          variables: [variableResult.getValue()],
          environment: environmentResult.getValue(),
          isActive: true,
        },
        new UUID(testId),
      );

      const persistence = managedPromptToPersistence(original);
      const domainResult = managedPromptToDomain({
        ...persistence,
        updatedAt: persistence.updatedAt ?? null,
      });

      expect(domainResult.isSuccess).toBe(true);
      const restored = domainResult.getValue();
      expect(restored.id.value).toBe(original.id.value);
      expect(restored.get("key").value).toBe(original.get("key").value);
      expect(restored.get("name").value).toBe(original.get("name").value);
    });
  });
});
