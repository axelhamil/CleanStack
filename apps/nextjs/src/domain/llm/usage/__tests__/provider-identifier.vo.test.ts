import { describe, expect, it } from "vitest";
import {
  ProviderIdentifier,
  type ProviderType,
} from "../value-objects/provider-identifier.vo";

describe("ProviderIdentifier", () => {
  describe("valid providers", () => {
    it("should create with 'openai' provider", () => {
      const result = ProviderIdentifier.create("openai" as ProviderType);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("openai");
    });

    it("should create with 'anthropic' provider", () => {
      const result = ProviderIdentifier.create("anthropic" as ProviderType);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("anthropic");
    });

    it("should create with 'google' provider", () => {
      const result = ProviderIdentifier.create("google" as ProviderType);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe("google");
    });
  });

  describe("invalid providers", () => {
    it("should fail for invalid provider string", () => {
      const result = ProviderIdentifier.create(
        "invalid-provider" as ProviderType,
      );

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("Invalid provider");
    });

    it("should fail for empty string", () => {
      const result = ProviderIdentifier.create("" as ProviderType);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for provider with different casing", () => {
      const result = ProviderIdentifier.create("OpenAI" as ProviderType);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("equality", () => {
    it("should be equal for same provider", () => {
      const provider1 = ProviderIdentifier.create(
        "openai" as ProviderType,
      ).getValue();
      const provider2 = ProviderIdentifier.create(
        "openai" as ProviderType,
      ).getValue();

      expect(provider1.equals(provider2)).toBe(true);
    });

    it("should not be equal for different providers", () => {
      const provider1 = ProviderIdentifier.create(
        "openai" as ProviderType,
      ).getValue();
      const provider2 = ProviderIdentifier.create(
        "anthropic" as ProviderType,
      ).getValue();

      expect(provider1.equals(provider2)).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should expose valid provider types", () => {
      expect(ProviderIdentifier.VALID_PROVIDERS).toContain("openai");
      expect(ProviderIdentifier.VALID_PROVIDERS).toContain("anthropic");
      expect(ProviderIdentifier.VALID_PROVIDERS).toContain("google");
    });

    it("should have isOpenAI helper", () => {
      const instance = ProviderIdentifier.create(
        "openai" as ProviderType,
      ).getValue();
      expect(instance.isOpenAI()).toBe(true);
      expect(instance.isAnthropic()).toBe(false);
      expect(instance.isGoogle()).toBe(false);
    });

    it("should have isAnthropic helper", () => {
      const instance = ProviderIdentifier.create(
        "anthropic" as ProviderType,
      ).getValue();
      expect(instance.isOpenAI()).toBe(false);
      expect(instance.isAnthropic()).toBe(true);
      expect(instance.isGoogle()).toBe(false);
    });

    it("should have isGoogle helper", () => {
      const instance = ProviderIdentifier.create(
        "google" as ProviderType,
      ).getValue();
      expect(instance.isOpenAI()).toBe(false);
      expect(instance.isAnthropic()).toBe(false);
      expect(instance.isGoogle()).toBe(true);
    });
  });
});
