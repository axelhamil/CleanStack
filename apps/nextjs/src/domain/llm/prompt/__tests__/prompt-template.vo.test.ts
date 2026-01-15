import { describe, expect, it } from "vitest";
import { PromptTemplate } from "../value-objects/prompt-template.vo";

describe("PromptTemplate Value Object", () => {
  describe("create()", () => {
    it("should create valid prompt template", () => {
      const result = PromptTemplate.create(
        "Hello {{name}}, welcome to {{company}}!" as string,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(
        "Hello {{name}}, welcome to {{company}}!",
      );
    });

    it("should create template without variables", () => {
      const result = PromptTemplate.create(
        "This is a static template." as string,
      );

      expect(result.isSuccess).toBe(true);
    });

    it("should fail for empty string", () => {
      const result = PromptTemplate.create("" as string);

      expect(result.isFailure).toBe(true);
    });

    it("should allow multiline templates", () => {
      const template = "Line 1: {{var1}}\nLine 2: {{var2}}";
      const result = PromptTemplate.create(template as string);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(template);
    });

    it("should allow nested curly braces in content", () => {
      const result = PromptTemplate.create(
        "JSON example: {key: {{value}}}" as string,
      );

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("extractVariables()", () => {
    it("should extract single variable", () => {
      const template = PromptTemplate.create(
        "Hello {{name}}!" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual(["name"]);
    });

    it("should extract multiple variables", () => {
      const template = PromptTemplate.create(
        "Hello {{firstName}} {{lastName}}!" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual(["firstName", "lastName"]);
    });

    it("should return empty array for no variables", () => {
      const template = PromptTemplate.create(
        "No variables here" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual([]);
    });

    it("should deduplicate repeated variables", () => {
      const template = PromptTemplate.create(
        "Hello {{name}}, your name is {{name}}" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual(["name"]);
    });

    it("should trim whitespace from variable names", () => {
      const template = PromptTemplate.create(
        "Hello {{ name }} and {{ company }}" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual(["name", "company"]);
    });

    it("should handle variables with underscores", () => {
      const template = PromptTemplate.create(
        "Hello {{first_name}} {{last_name}}" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual(["first_name", "last_name"]);
    });

    it("should handle variables with numbers", () => {
      const template = PromptTemplate.create(
        "Value: {{var1}} and {{var2}}" as string,
      ).getValue();

      expect(template.extractVariables()).toEqual(["var1", "var2"]);
    });
  });

  describe("render()", () => {
    it("should render template with all variables", () => {
      const template = PromptTemplate.create(
        "Hello {{name}}, welcome to {{company}}!" as string,
      ).getValue();

      const result = template.render({ name: "Alice", company: "Acme" });

      expect(result).toBe("Hello Alice, welcome to Acme!");
    });

    it("should keep unmatched variables as placeholders", () => {
      const template = PromptTemplate.create(
        "Hello {{name}}, welcome to {{company}}!" as string,
      ).getValue();

      const result = template.render({ name: "Alice" });

      expect(result).toBe("Hello Alice, welcome to {{company}}!");
    });

    it("should handle empty variables object", () => {
      const template = PromptTemplate.create(
        "Hello {{name}}!" as string,
      ).getValue();

      const result = template.render({});

      expect(result).toBe("Hello {{name}}!");
    });

    it("should render template without variables", () => {
      const template = PromptTemplate.create(
        "Static content" as string,
      ).getValue();

      const result = template.render({ name: "ignored" });

      expect(result).toBe("Static content");
    });

    it("should handle variables with whitespace in template", () => {
      const template = PromptTemplate.create(
        "Hello {{ name }}!" as string,
      ).getValue();

      const result = template.render({ name: "Alice" });

      expect(result).toBe("Hello Alice!");
    });

    it("should handle multiple occurrences of same variable", () => {
      const template = PromptTemplate.create(
        "{{name}} said: Hello, I am {{name}}" as string,
      ).getValue();

      const result = template.render({ name: "Bob" });

      expect(result).toBe("Bob said: Hello, I am Bob");
    });

    it("should handle empty string values", () => {
      const template = PromptTemplate.create(
        "Prefix{{value}}Suffix" as string,
      ).getValue();

      const result = template.render({ value: "" });

      expect(result).toBe("PrefixSuffix");
    });

    it("should handle multiline templates", () => {
      const template = PromptTemplate.create(
        "Line 1: {{var1}}\nLine 2: {{var2}}" as string,
      ).getValue();

      const result = template.render({ var1: "A", var2: "B" });

      expect(result).toBe("Line 1: A\nLine 2: B");
    });
  });

  describe("equals()", () => {
    it("should be equal for same templates", () => {
      const template1 = PromptTemplate.create(
        "Hello {{name}}!" as string,
      ).getValue();
      const template2 = PromptTemplate.create(
        "Hello {{name}}!" as string,
      ).getValue();

      expect(template1.equals(template2)).toBe(true);
    });

    it("should not be equal for different templates", () => {
      const template1 = PromptTemplate.create(
        "Hello {{name}}!" as string,
      ).getValue();
      const template2 = PromptTemplate.create(
        "Goodbye {{name}}!" as string,
      ).getValue();

      expect(template1.equals(template2)).toBe(false);
    });
  });
});
