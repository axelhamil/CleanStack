import { describe, expect, it } from "vitest";
import {
  type ApplicationError,
  ApplicationErrors,
  type DomainError,
  DomainErrors,
  type InfrastructureError,
  InfrastructureErrors,
} from "../domain-errors";

describe("DomainErrors", () => {
  describe("User domain errors", () => {
    it("should have INVALID_EMAIL error", () => {
      expect(DomainErrors.INVALID_EMAIL).toBe("Invalid email format");
    });

    it("should have INVALID_PASSWORD error", () => {
      expect(DomainErrors.INVALID_PASSWORD).toBe(
        "Password must be at least 8 characters",
      );
    });

    it("should have EMAIL_ALREADY_EXISTS error", () => {
      expect(DomainErrors.EMAIL_ALREADY_EXISTS).toBe(
        "A user with this email already exists",
      );
    });

    it("should have USER_NOT_FOUND error", () => {
      expect(DomainErrors.USER_NOT_FOUND).toBe("User not found");
    });

    it("should have INVALID_CREDENTIALS error", () => {
      expect(DomainErrors.INVALID_CREDENTIALS).toBe(
        "Invalid email or password",
      );
    });

    it("should have EMAIL_NOT_VERIFIED error", () => {
      expect(DomainErrors.EMAIL_NOT_VERIFIED).toBe("Email not verified");
    });
  });

  describe("Subscription domain errors", () => {
    it("should have SUBSCRIPTION_NOT_FOUND error", () => {
      expect(DomainErrors.SUBSCRIPTION_NOT_FOUND).toBe(
        "Subscription not found",
      );
    });

    it("should have SUBSCRIPTION_EXPIRED error", () => {
      expect(DomainErrors.SUBSCRIPTION_EXPIRED).toBe(
        "Subscription has expired",
      );
    });

    it("should have PLAN_NOT_AVAILABLE error", () => {
      expect(DomainErrors.PLAN_NOT_AVAILABLE).toBe(
        "Selected plan is not available",
      );
    });

    it("should have INVALID_SUBSCRIPTION_STATUS error", () => {
      expect(DomainErrors.INVALID_SUBSCRIPTION_STATUS).toBe(
        "Invalid subscription status",
      );
    });
  });

  describe("General errors", () => {
    it("should have VALIDATION_FAILED error", () => {
      expect(DomainErrors.VALIDATION_FAILED).toBe("Validation failed");
    });

    it("should have OPERATION_FAILED error", () => {
      expect(DomainErrors.OPERATION_FAILED).toBe(
        "Operation could not be completed",
      );
    });
  });

  describe("type safety", () => {
    it("should be assignable to DomainError type", () => {
      const error: DomainError = DomainErrors.INVALID_EMAIL;
      expect(error).toBeDefined();
    });
  });
});

describe("ApplicationErrors", () => {
  it("should have UNAUTHORIZED error", () => {
    expect(ApplicationErrors.UNAUTHORIZED).toBe("Authentication required");
  });

  it("should have FORBIDDEN error", () => {
    expect(ApplicationErrors.FORBIDDEN).toBe(
      "You don't have permission to perform this action",
    );
  });

  it("should have NOT_FOUND error", () => {
    expect(ApplicationErrors.NOT_FOUND).toBe("Resource not found");
  });

  it("should have CONFLICT error", () => {
    expect(ApplicationErrors.CONFLICT).toBe("Resource already exists");
  });

  it("should have RATE_LIMITED error", () => {
    expect(ApplicationErrors.RATE_LIMITED).toBe(
      "Too many requests, please try again later",
    );
  });

  describe("type safety", () => {
    it("should be assignable to ApplicationError type", () => {
      const error: ApplicationError = ApplicationErrors.UNAUTHORIZED;
      expect(error).toBeDefined();
    });
  });
});

describe("InfrastructureErrors", () => {
  it("should have DB_CONNECTION_FAILED error", () => {
    expect(InfrastructureErrors.DB_CONNECTION_FAILED).toBe(
      "Database connection failed. Is PostgreSQL running?",
    );
  });

  it("should have DB_QUERY_FAILED error", () => {
    expect(InfrastructureErrors.DB_QUERY_FAILED).toBe("Database query failed");
  });

  it("should have AUTH_PROVIDER_ERROR error", () => {
    expect(InfrastructureErrors.AUTH_PROVIDER_ERROR).toBe(
      "Authentication service unavailable",
    );
  });

  it("should have PAYMENT_PROVIDER_ERROR error", () => {
    expect(InfrastructureErrors.PAYMENT_PROVIDER_ERROR).toBe(
      "Payment service unavailable",
    );
  });

  it("should have EMAIL_SEND_FAILED error", () => {
    expect(InfrastructureErrors.EMAIL_SEND_FAILED).toBe("Failed to send email");
  });

  describe("type safety", () => {
    it("should be assignable to InfrastructureError type", () => {
      const error: InfrastructureError =
        InfrastructureErrors.DB_CONNECTION_FAILED;
      expect(error).toBeDefined();
    });
  });
});
