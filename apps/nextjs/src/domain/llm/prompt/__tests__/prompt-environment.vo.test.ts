import { describe, expect, it } from "vitest";
import type { PromptEnvironmentType } from "../value-objects/prompt-environment.vo";
import { PromptEnvironment } from "../value-objects/prompt-environment.vo";

describe("PromptEnvironment Value Object", () => {
  describe("create()", () => {
    it("should create development environment", () => {
      const result = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("development");
    });

    it("should create staging environment", () => {
      const result = PromptEnvironment.create(
        "staging" as PromptEnvironmentType,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("staging");
    });

    it("should create production environment", () => {
      const result = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      );

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("production");
    });

    it("should fail for invalid environment", () => {
      const result = PromptEnvironment.create(
        "invalid" as PromptEnvironmentType,
      );

      expect(result.isFailure).toBe(true);
    });

    it("should fail for empty string", () => {
      const result = PromptEnvironment.create("" as PromptEnvironmentType);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for uppercase environment", () => {
      const result = PromptEnvironment.create(
        "PRODUCTION" as PromptEnvironmentType,
      );

      expect(result.isFailure).toBe(true);
    });
  });

  describe("isDevelopment()", () => {
    it("should return true for development", () => {
      const env = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      ).getValue();

      expect(env.isDevelopment()).toBe(true);
    });

    it("should return false for staging", () => {
      const env = PromptEnvironment.create(
        "staging" as PromptEnvironmentType,
      ).getValue();

      expect(env.isDevelopment()).toBe(false);
    });

    it("should return false for production", () => {
      const env = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      ).getValue();

      expect(env.isDevelopment()).toBe(false);
    });
  });

  describe("isStaging()", () => {
    it("should return true for staging", () => {
      const env = PromptEnvironment.create(
        "staging" as PromptEnvironmentType,
      ).getValue();

      expect(env.isStaging()).toBe(true);
    });

    it("should return false for development", () => {
      const env = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      ).getValue();

      expect(env.isStaging()).toBe(false);
    });

    it("should return false for production", () => {
      const env = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      ).getValue();

      expect(env.isStaging()).toBe(false);
    });
  });

  describe("isProduction()", () => {
    it("should return true for production", () => {
      const env = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      ).getValue();

      expect(env.isProduction()).toBe(true);
    });

    it("should return false for development", () => {
      const env = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      ).getValue();

      expect(env.isProduction()).toBe(false);
    });

    it("should return false for staging", () => {
      const env = PromptEnvironment.create(
        "staging" as PromptEnvironmentType,
      ).getValue();

      expect(env.isProduction()).toBe(false);
    });
  });

  describe("equals()", () => {
    it("should be equal for same values", () => {
      const env1 = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      ).getValue();
      const env2 = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      ).getValue();

      expect(env1.equals(env2)).toBe(true);
    });

    it("should not be equal for different values", () => {
      const env1 = PromptEnvironment.create(
        "development" as PromptEnvironmentType,
      ).getValue();
      const env2 = PromptEnvironment.create(
        "production" as PromptEnvironmentType,
      ).getValue();

      expect(env1.equals(env2)).toBe(false);
    });
  });
});
