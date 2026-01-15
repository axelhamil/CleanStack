import { describe, expect, it } from "vitest";
import { DomainPrompt } from "../domain-prompt";

describe("DomainPrompt", () => {
  describe("render()", () => {
    it("should render template with single variable", () => {
      const prompt = new DomainPrompt(
        "greeting",
        "Hello, {{name}}! Welcome to our service.",
      );

      const result = prompt.render({ name: "Alice" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Hello, Alice! Welcome to our service.");
    });

    it("should render template with multiple variables", () => {
      const prompt = new DomainPrompt(
        "order-confirmation",
        "Order #{{orderId}} for {{customerName}} has been confirmed. Total: {{amount}}",
      );

      const result = prompt.render({
        orderId: "12345",
        customerName: "Bob",
        amount: "$99.99",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe(
        "Order #12345 for Bob has been confirmed. Total: $99.99",
      );
    });

    it("should render template with same variable multiple times", () => {
      const prompt = new DomainPrompt(
        "repeated",
        "{{name}} is great. {{name}} is awesome.",
      );

      const result = prompt.render({ name: "Claude" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Claude is great. Claude is awesome.");
    });

    it("should fail when required variable is missing", () => {
      const prompt = new DomainPrompt(
        "greeting",
        "Hello, {{name}}! Your email is {{email}}.",
      );

      const result = prompt.render({ name: "Alice" });

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("email");
    });

    it("should render template with no variables", () => {
      const prompt = new DomainPrompt("static", "This is a static message.");

      const result = prompt.render({});

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("This is a static message.");
    });

    it("should ignore extra variables not in template", () => {
      const prompt = new DomainPrompt("simple", "Hello, {{name}}!");

      const result = prompt.render({ name: "Alice", extra: "unused" });

      expect(result.isSuccess).toBe(true);
      expect(result.getValue()).toBe("Hello, Alice!");
    });
  });

  describe("getVariables()", () => {
    it("should extract single variable", () => {
      const prompt = new DomainPrompt("test", "Hello, {{name}}!");

      const variables = prompt.getVariables();

      expect(variables).toEqual(["name"]);
    });

    it("should extract multiple unique variables", () => {
      const prompt = new DomainPrompt(
        "test",
        "{{greeting}}, {{name}}! Your order {{orderId}} is ready.",
      );

      const variables = prompt.getVariables();

      expect(variables).toEqual(["greeting", "name", "orderId"]);
    });

    it("should return unique variables only", () => {
      const prompt = new DomainPrompt(
        "test",
        "{{name}} likes {{name}} and {{other}}.",
      );

      const variables = prompt.getVariables();

      expect(variables).toEqual(["name", "other"]);
    });

    it("should return empty array for no variables", () => {
      const prompt = new DomainPrompt("test", "Static content only.");

      const variables = prompt.getVariables();

      expect(variables).toEqual([]);
    });
  });

  describe("properties", () => {
    it("should expose key", () => {
      const prompt = new DomainPrompt("my-prompt-key", "Content here.");

      expect(prompt.key).toBe("my-prompt-key");
    });

    it("should expose template", () => {
      const prompt = new DomainPrompt("key", "Template {{var}} content.");

      expect(prompt.template).toBe("Template {{var}} content.");
    });
  });

  describe("static prompts", () => {
    it("should have SYSTEM_DEFAULT prompt defined", () => {
      expect(DomainPrompt.SYSTEM_DEFAULT).toBeDefined();
      expect(DomainPrompt.SYSTEM_DEFAULT.key).toBe("system-default");
    });

    it("should have ERROR_GENERIC prompt defined", () => {
      expect(DomainPrompt.ERROR_GENERIC).toBeDefined();
      expect(DomainPrompt.ERROR_GENERIC.key).toBe("error-generic");
    });

    it("should have CONVERSATION_TITLE_GENERATOR prompt defined", () => {
      expect(DomainPrompt.CONVERSATION_TITLE_GENERATOR).toBeDefined();
      expect(DomainPrompt.CONVERSATION_TITLE_GENERATOR.key).toBe(
        "conversation-title-generator",
      );
    });
  });
});
