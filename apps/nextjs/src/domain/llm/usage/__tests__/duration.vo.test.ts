import { describe, expect, it } from "vitest";
import { Duration } from "../value-objects/duration.vo";

describe("Duration", () => {
  describe("valid values", () => {
    it("should create with positive milliseconds", () => {
      const result = Duration.create(1000 as number);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(1000);
    });

    it("should create with zero", () => {
      const result = Duration.create(0 as number);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(0);
    });

    it("should create with large duration", () => {
      const result = Duration.create(60000 as number);

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(60000);
    });
  });

  describe("invalid values", () => {
    it("should fail for negative milliseconds", () => {
      const result = Duration.create(-1 as number);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("non-negative");
    });

    it("should fail for decimal milliseconds", () => {
      const result = Duration.create(100.5 as number);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toContain("integer");
    });

    it("should fail for NaN", () => {
      const result = Duration.create(Number.NaN as number);

      expect(result.isFailure).toBe(true);
    });

    it("should fail for Infinity", () => {
      const result = Duration.create(Number.POSITIVE_INFINITY as number);

      expect(result.isFailure).toBe(true);
    });
  });

  describe("equality", () => {
    it("should be equal for same duration", () => {
      const duration1 = Duration.create(1000 as number).getValue();
      const duration2 = Duration.create(1000 as number).getValue();

      expect(duration1.equals(duration2)).toBe(true);
    });

    it("should not be equal for different durations", () => {
      const duration1 = Duration.create(1000 as number).getValue();
      const duration2 = Duration.create(2000 as number).getValue();

      expect(duration1.equals(duration2)).toBe(false);
    });
  });

  describe("helper methods", () => {
    it("should convert to seconds", () => {
      const duration = Duration.create(1500 as number).getValue();

      expect(duration.toSeconds()).toBe(1.5);
    });

    it("should have zero factory method", () => {
      const result = Duration.zero();

      expect(result.isSuccess).toBe(true);
      expect(result.getValue().value).toBe(0);
    });

    it("should format as human readable", () => {
      const duration = Duration.create(1500 as number).getValue();

      expect(duration.toHumanReadable()).toBe("1500ms");
    });

    it("should format longer duration as seconds", () => {
      const duration = Duration.create(65000 as number).getValue();

      expect(duration.toHumanReadable()).toBe("65.0s");
    });
  });
});
