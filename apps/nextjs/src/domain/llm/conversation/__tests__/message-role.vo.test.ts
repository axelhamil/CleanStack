import { describe, expect, it } from "vitest";
import {
  MESSAGE_ROLES,
  MessageRole,
  type MessageRoleType,
} from "../value-objects/message-role.vo";

describe("MessageRole Value Object", () => {
  describe("create()", () => {
    it("should create valid user role", () => {
      const result = MessageRole.create("user" as MessageRoleType);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("user");
    });

    it("should create valid assistant role", () => {
      const result = MessageRole.create("assistant" as MessageRoleType);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("assistant");
    });

    it("should create valid system role", () => {
      const result = MessageRole.create("system" as MessageRoleType);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("system");
    });

    it("should fail for invalid role", () => {
      const result = MessageRole.create("invalid" as MessageRoleType);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for empty role", () => {
      const result = MessageRole.create("" as MessageRoleType);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("role helpers", () => {
    it("should return true for isUser when role is user", () => {
      const role = MessageRole.create("user" as MessageRoleType).getValue();

      expect(role.isUser).toBe(true);
      expect(role.isAssistant).toBe(false);
      expect(role.isSystem).toBe(false);
    });

    it("should return true for isAssistant when role is assistant", () => {
      const role = MessageRole.create(
        "assistant" as MessageRoleType,
      ).getValue();

      expect(role.isUser).toBe(false);
      expect(role.isAssistant).toBe(true);
      expect(role.isSystem).toBe(false);
    });

    it("should return true for isSystem when role is system", () => {
      const role = MessageRole.create("system" as MessageRoleType).getValue();

      expect(role.isUser).toBe(false);
      expect(role.isAssistant).toBe(false);
      expect(role.isSystem).toBe(true);
    });
  });

  describe("MESSAGE_ROLES constant", () => {
    it("should contain all valid roles", () => {
      expect(MESSAGE_ROLES).toContain("user");
      expect(MESSAGE_ROLES).toContain("assistant");
      expect(MESSAGE_ROLES).toContain("system");
      expect(MESSAGE_ROLES.length).toBe(3);
    });
  });

  describe("equals()", () => {
    it("should be equal for same role", () => {
      const role1 = MessageRole.create("user" as MessageRoleType).getValue();
      const role2 = MessageRole.create("user" as MessageRoleType).getValue();

      expect(role1.equals(role2)).toBe(true);
    });

    it("should not be equal for different roles", () => {
      const role1 = MessageRole.create("user" as MessageRoleType).getValue();
      const role2 = MessageRole.create(
        "assistant" as MessageRoleType,
      ).getValue();

      expect(role1.equals(role2)).toBe(false);
    });
  });
});
