import { Option, UUID } from "@packages/ddd-kit";
import { describe, expect, it } from "vitest";
import { ManagedPromptActivatedEvent } from "../events/managed-prompt-activated.event";
import { ManagedPromptCreatedEvent } from "../events/managed-prompt-created.event";
import { ManagedPromptDeactivatedEvent } from "../events/managed-prompt-deactivated.event";
import { ManagedPromptUpdatedEvent } from "../events/managed-prompt-updated.event";
import { ManagedPrompt } from "../managed-prompt.aggregate";
import { ManagedPromptId } from "../managed-prompt-id";
import { PromptDescription } from "../value-objects/prompt-description.vo";
import type { PromptEnvironmentType } from "../value-objects/prompt-environment.vo";
import { PromptEnvironment } from "../value-objects/prompt-environment.vo";
import { PromptKey } from "../value-objects/prompt-key.vo";
import { PromptName } from "../value-objects/prompt-name.vo";
import { PromptTemplate } from "../value-objects/prompt-template.vo";
import type { PromptVariableValue } from "../value-objects/prompt-variable.vo";
import { PromptVariable } from "../value-objects/prompt-variable.vo";

function createValidProps() {
  return {
    key: PromptKey.create("welcome-email" as string).getValue(),
    name: PromptName.create("Welcome Email Template" as string).getValue(),
    description: Option.some(
      PromptDescription.create("A welcome email template" as string).getValue(),
    ),
    template: PromptTemplate.create(
      "Hello {{name}}, welcome to {{company}}!" as string,
    ).getValue(),
    variables: [
      PromptVariable.create({
        name: "name",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue(),
      PromptVariable.create({
        name: "company",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue(),
    ],
    environment: PromptEnvironment.create(
      "development" as PromptEnvironmentType,
    ).getValue(),
    isActive: true,
  };
}

describe("ManagedPrompt Aggregate", () => {
  describe("create()", () => {
    it("should create a new managed prompt with version 1", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      expect(prompt.get("version")).toBe(1);
      expect(prompt.get("key").value).toBe("welcome-email");
      expect(prompt.get("name").value).toBe("Welcome Email Template");
      expect(prompt.get("isActive")).toBe(true);
    });

    it("should emit ManagedPromptCreatedEvent on create", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      expect(prompt.domainEvents).toHaveLength(1);
      expect(prompt.domainEvents[0]).toBeInstanceOf(ManagedPromptCreatedEvent);
    });

    it("should set createdAt on create", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      expect(prompt.get("createdAt")).toBeInstanceOf(Date);
    });

    it("should set updatedAt to None on create", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      expect(prompt.get("updatedAt").isNone()).toBe(true);
    });

    it("should use provided ID when specified", () => {
      const props = createValidProps();
      const customId = new UUID();
      const prompt = ManagedPrompt.create(props, customId);

      expect(prompt.id.value).toBe(customId.value);
    });

    it("should generate new ID when not provided", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      expect(prompt.id).toBeInstanceOf(ManagedPromptId);
      expect(prompt.id.value).toBeDefined();
    });
  });

  describe("reconstitute()", () => {
    it("should restore prompt without emitting events", () => {
      const props = createValidProps();
      const id = new UUID();
      const fullProps = {
        ...props,
        version: 3,
        createdAt: new Date("2024-01-01"),
        updatedAt: Option.some(new Date("2024-06-01")),
      };

      const prompt = ManagedPrompt.reconstitute(fullProps, id);

      expect(prompt.domainEvents).toHaveLength(0);
      expect(prompt.get("version")).toBe(3);
      expect(prompt.id.value).toBe(id.value);
    });
  });

  describe("updateContent()", () => {
    it("should increment version when content is updated", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      const newTemplate = PromptTemplate.create(
        "Updated: Hello {{name}}!" as string,
      ).getValue();
      prompt.updateContent(newTemplate, props.variables);

      expect(prompt.get("version")).toBe(2);
    });

    it("should emit ManagedPromptUpdatedEvent on update", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      const newTemplate = PromptTemplate.create(
        "Updated: Hello {{name}}!" as string,
      ).getValue();
      prompt.updateContent(newTemplate, props.variables);

      expect(prompt.domainEvents).toHaveLength(1);
      expect(prompt.domainEvents[0]).toBeInstanceOf(ManagedPromptUpdatedEvent);
    });

    it("should include previous version in event payload", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      const newTemplate = PromptTemplate.create(
        "Updated: Hello {{name}}!" as string,
      ).getValue();
      prompt.updateContent(newTemplate, props.variables);

      const event = prompt.domainEvents[0] as ManagedPromptUpdatedEvent;
      expect(event.payload.previousVersion).toBe(1);
      expect(event.payload.newVersion).toBe(2);
    });

    it("should update template", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const newTemplate = PromptTemplate.create(
        "New template: {{name}}" as string,
      ).getValue();
      prompt.updateContent(newTemplate, props.variables);

      expect(prompt.get("template").value).toBe("New template: {{name}}");
    });

    it("should update name when provided", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const newTemplate = PromptTemplate.create(
        "New template" as string,
      ).getValue();
      const newName = PromptName.create("New Name" as string).getValue();
      prompt.updateContent(newTemplate, props.variables, newName);

      expect(prompt.get("name").value).toBe("New Name");
    });

    it("should set updatedAt on update", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const newTemplate = PromptTemplate.create(
        "Updated template" as string,
      ).getValue();
      prompt.updateContent(newTemplate, props.variables);

      expect(prompt.get("updatedAt").isSome()).toBe(true);
    });
  });

  describe("activate()", () => {
    it("should set isActive to true", () => {
      const props = { ...createValidProps(), isActive: false };
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      prompt.activate();

      expect(prompt.get("isActive")).toBe(true);
    });

    it("should emit ManagedPromptActivatedEvent", () => {
      const props = { ...createValidProps(), isActive: false };
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      prompt.activate();

      expect(prompt.domainEvents).toHaveLength(1);
      expect(prompt.domainEvents[0]).toBeInstanceOf(
        ManagedPromptActivatedEvent,
      );
    });

    it("should not emit event if already active", () => {
      const props = { ...createValidProps(), isActive: true };
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      prompt.activate();

      expect(prompt.domainEvents).toHaveLength(0);
    });

    it("should set updatedAt on activate", () => {
      const props = { ...createValidProps(), isActive: false };
      const prompt = ManagedPrompt.create(props);

      prompt.activate();

      expect(prompt.get("updatedAt").isSome()).toBe(true);
    });
  });

  describe("deactivate()", () => {
    it("should set isActive to false", () => {
      const props = { ...createValidProps(), isActive: true };
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      prompt.deactivate();

      expect(prompt.get("isActive")).toBe(false);
    });

    it("should emit ManagedPromptDeactivatedEvent", () => {
      const props = { ...createValidProps(), isActive: true };
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      prompt.deactivate();

      expect(prompt.domainEvents).toHaveLength(1);
      expect(prompt.domainEvents[0]).toBeInstanceOf(
        ManagedPromptDeactivatedEvent,
      );
    });

    it("should not emit event if already inactive", () => {
      const props = { ...createValidProps(), isActive: false };
      const prompt = ManagedPrompt.create(props);
      prompt.clearEvents();

      prompt.deactivate();

      expect(prompt.domainEvents).toHaveLength(0);
    });
  });

  describe("render()", () => {
    it("should substitute variables correctly", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const result = prompt.render({ name: "Alice", company: "Acme" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Hello Alice, welcome to Acme!");
    });

    it("should fail when required variable is missing", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const result = prompt.render({ name: "Alice" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("company");
    });

    it("should use default value for optional variable", () => {
      const props = {
        ...createValidProps(),
        template: PromptTemplate.create(
          "Hello {{name}}, your role is {{role}}" as string,
        ).getValue(),
        variables: [
          PromptVariable.create({
            name: "name",
            type: "string",
            required: true,
          } as PromptVariableValue).getValue(),
          PromptVariable.create({
            name: "role",
            type: "string",
            required: false,
            defaultValue: "Member",
          } as PromptVariableValue).getValue(),
        ],
      };
      const prompt = ManagedPrompt.create(props);

      const result = prompt.render({ name: "Alice" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Hello Alice, your role is Member");
    });

    it("should override default value when variable is provided", () => {
      const props = {
        ...createValidProps(),
        template: PromptTemplate.create(
          "Hello {{name}}, your role is {{role}}" as string,
        ).getValue(),
        variables: [
          PromptVariable.create({
            name: "name",
            type: "string",
            required: true,
          } as PromptVariableValue).getValue(),
          PromptVariable.create({
            name: "role",
            type: "string",
            required: false,
            defaultValue: "Member",
          } as PromptVariableValue).getValue(),
        ],
      };
      const prompt = ManagedPrompt.create(props);

      const result = prompt.render({ name: "Alice", role: "Admin" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Hello Alice, your role is Admin");
    });

    it("should handle empty variables list", () => {
      const props = {
        ...createValidProps(),
        template: PromptTemplate.create(
          "Static template content" as string,
        ).getValue(),
        variables: [],
      };
      const prompt = ManagedPrompt.create(props);

      const result = prompt.render({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Static template content");
    });
  });

  describe("changeEnvironment()", () => {
    it("should change the environment", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const newEnv = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      ).getValue();
      prompt.changeEnvironment(newEnv);

      expect(prompt.get("environment").value).toBe("production");
    });

    it("should set updatedAt on environment change", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      const newEnv = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      ).getValue();
      prompt.changeEnvironment(newEnv);

      expect(prompt.get("updatedAt").isSome()).toBe(true);
    });
  });

  describe("id getter", () => {
    it("should return ManagedPromptId instance", () => {
      const props = createValidProps();
      const prompt = ManagedPrompt.create(props);

      expect(prompt.id).toBeInstanceOf(ManagedPromptId);
    });
  });
});
