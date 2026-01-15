export const DomainErrors = {
  // User domain
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: "Password must be at least 8 characters",
  EMAIL_ALREADY_EXISTS: "A user with this email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Email not verified",

  // Subscription domain
  SUBSCRIPTION_NOT_FOUND: "Subscription not found",
  SUBSCRIPTION_EXPIRED: "Subscription has expired",
  PLAN_NOT_AVAILABLE: "Selected plan is not available",
  INVALID_SUBSCRIPTION_STATUS: "Invalid subscription status",

  // General
  VALIDATION_FAILED: "Validation failed",
  OPERATION_FAILED: "Operation could not be completed",
} as const;

export const ApplicationErrors = {
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "You don't have permission to perform this action",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  RATE_LIMITED: "Too many requests, please try again later",
} as const;

export const InfrastructureErrors = {
  DB_CONNECTION_FAILED: "Database connection failed. Is PostgreSQL running?",
  DB_QUERY_FAILED: "Database query failed",
  AUTH_PROVIDER_ERROR: "Authentication service unavailable",
  PAYMENT_PROVIDER_ERROR: "Payment service unavailable",
  EMAIL_SEND_FAILED: "Failed to send email",
} as const;

export type DomainError = (typeof DomainErrors)[keyof typeof DomainErrors];
export type ApplicationError =
  (typeof ApplicationErrors)[keyof typeof ApplicationErrors];
export type InfrastructureError =
  (typeof InfrastructureErrors)[keyof typeof InfrastructureErrors];
