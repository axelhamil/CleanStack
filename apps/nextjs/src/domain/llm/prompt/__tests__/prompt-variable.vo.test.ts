import { describe, expect, it } from "vitest";
import type { PromptVariableValue } from "../value-objects/prompt-variable.vo";
import { PromptVariable } from "../value-objects/prompt-variable.vo";

describe("PromptVariable Value Object", () => {
  describe("create()", () => {
    it("should create valid string variable", () => {
      const result = PromptVariable.create({
        name: "userName",
        type: "string",
        required: true,
      } as PromptVariableValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().name).toBe("userName");
      expect(result.getValue().type).toBe("string");
      expect(result.getValue().required).toBe(true);
    });

    it("should create valid number variable", () => {
      const result = PromptVariable.create({
        name: "count",
        type: "number",
        required: true,
      } as PromptVariableValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe("number");
    });

    it("should create valid boolean variable", () => {
      const result = PromptVariable.create({
        name: "isActive",
        type: "boolean",
        required: false,
      } as PromptVariableValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().type).toBe("boolean");
    });

    it("should create variable with default value", () => {
      const result = PromptVariable.create({
        name: "greeting",
        type: "string",
        required: false,
        defaultValue: "Hello",
      } as PromptVariableValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().defaultValue).toBe("Hello");
    });

    it("should create optional variable", () => {
      const result = PromptVariable.create({
        name: "nickname",
        type: "string",
        required: false,
      } as PromptVariableValue);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().required).toBe(false);
    });

    it("should fail for empty name", () => {
      const result = PromptVariable.create({
        name: "",
        type: "string",
        required: true,
      } as PromptVariableValue);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for invalid type", () => {
      const result = PromptVariable.create({
        name: "test",
        type: "invalid" as "string",
        required: true,
      } as PromptVariableValue);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("getters", () => {
    it("should return name through getter", () => {
      const variable = PromptVariable.create({
        name: "testName",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      expect(variable.name).toBe("testName");
    });

    it("should return type through getter", () => {
      const variable = PromptVariable.create({
        name: "test",
        type: "number",
        required: true,
      } as PromptVariableValue).getValue();

      expect(variable.type).toBe("number");
    });

    it("should return required through getter", () => {
      const variable = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
      } as PromptVariableValue).getValue();

      expect(variable.required).toBe(false);
    });

    it("should return defaultValue through getter", () => {
      const variable = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
        defaultValue: "default",
      } as PromptVariableValue).getValue();

      expect(variable.defaultValue).toBe("default");
    });

    it("should return undefined for missing defaultValue", () => {
      const variable = PromptVariable.create({
        name: "test",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      expect(variable.defaultValue).toBeUndefined();
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const var1 = PromptVariable.create({
        name: "test",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      const var2 = PromptVariable.create({
        name: "test",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      expect(var1.equals(var2)).toBe(true);
    });

    it("should be equal including defaultValue", () => {
      const var1 = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
        defaultValue: "hello",
      } as PromptVariableValue).getValue();

      const var2 = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
        defaultValue: "hello",
      } as PromptVariableValue).getValue();

      expect(var1.equals(var2)).toBe(true);
    });

    it("should not be equal for different names", () => {
      const var1 = PromptVariable.create({
        name: "test1",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      const var2 = PromptVariable.create({
        name: "test2",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      expect(var1.equals(var2)).toBe(false);
    });

    it("should not be equal for different types", () => {
      const var1 = PromptVariable.create({
        name: "test",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      const var2 = PromptVariable.create({
        name: "test",
        type: "number",
        required: true,
      } as PromptVariableValue).getValue();

      expect(var1.equals(var2)).toBe(false);
    });

    it("should not be equal for different required values", () => {
      const var1 = PromptVariable.create({
        name: "test",
        type: "string",
        required: true,
      } as PromptVariableValue).getValue();

      const var2 = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
      } as PromptVariableValue).getValue();

      expect(var1.equals(var2)).toBe(false);
    });

    it("should not be equal for different defaultValues", () => {
      const var1 = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
        defaultValue: "hello",
      } as PromptVariableValue).getValue();

      const var2 = PromptVariable.create({
        name: "test",
        type: "string",
        required: false,
        defaultValue: "world",
      } as PromptVariableValue).getValue();

      expect(var1.equals(var2)).toBe(false);
    });
  });
});
