# DX-003: Error Messages

## Story

**As a** developer
**I want** clear error messages
**So that** I can quickly diagnose and fix issues

## Acceptance Criteria

- [ ] Domain errors are descriptive
- [ ] Application errors include context
- [ ] Infrastructure errors are actionable
- [ ] Error codes for common issues

## Technical Notes

### Error Categories

```typescript
// Domain Errors - Business rule violations
export const DomainErrors = {
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: "Password must be at least 8 characters",
  EMAIL_ALREADY_EXISTS: "A user with this email already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  SUBSCRIPTION_EXPIRED: "Subscription has expired",
  PLAN_NOT_AVAILABLE: "Selected plan is not available",
} as const;

// Application Errors - Use case failures
export const ApplicationErrors = {
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "You don't have permission to perform this action",
  VALIDATION_FAILED: "Input validation failed",
  OPERATION_FAILED: "Operation could not be completed",
} as const;

// Infrastructure Errors - System failures
export const InfrastructureErrors = {
  DB_CONNECTION_FAILED: "Database connection failed. Is PostgreSQL running?",
  DB_QUERY_FAILED: "Database query failed",
  AUTH_PROVIDER_ERROR: "Authentication service unavailable",
  PAYMENT_PROVIDER_ERROR: "Payment service unavailable",
  EMAIL_SEND_FAILED: "Failed to send email",
} as const;
```

### Error Formatting

```typescript
// src/common/errors/format-error.ts
export interface FormattedError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  suggestion?: string;
}

export function formatDomainError(error: string): FormattedError {
  const suggestions: Record<string, string> = {
    [DomainErrors.INVALID_EMAIL]: "Check email format: user@example.com",
    [DomainErrors.INVALID_PASSWORD]: "Use at least 8 characters with mixed case",
    [DomainErrors.EMAIL_ALREADY_EXISTS]: "Try logging in or use a different email",
    [DomainErrors.USER_NOT_FOUND]: "Check the email address or sign up",
  };

  return {
    code: errorToCode(error),
    message: error,
    suggestion: suggestions[error],
  };
}

function errorToCode(error: string): string {
  return error
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_");
}
```

### Value Object Errors

```typescript
// Clear validation messages in VOs
export class Email extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    if (!value) {
      return Result.fail("Email is required");
    }
    if (!value.includes("@")) {
      return Result.fail("Email must contain @ symbol");
    }
    if (value.length > 255) {
      return Result.fail("Email must be less than 255 characters");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Result.fail("Invalid email format. Expected: user@example.com");
    }
    return Result.ok(value.toLowerCase());
  }
}

export class Password extends ValueObject<string> {
  protected validate(value: string): Result<string> {
    if (!value) {
      return Result.fail("Password is required");
    }
    if (value.length < 8) {
      return Result.fail(`Password must be at least 8 characters (got ${value.length})`);
    }
    if (value.length > 128) {
      return Result.fail("Password must be less than 128 characters");
    }
    if (!/[A-Z]/.test(value)) {
      return Result.fail("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(value)) {
      return Result.fail("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(value)) {
      return Result.fail("Password must contain at least one number");
    }
    return Result.ok(value);
  }
}
```

### UseCase Error Handling

```typescript
export class SignInUseCase implements UseCase<Input, Output> {
  async execute(input: Input): Promise<Result<Output>> {
    // Validate inputs with clear errors
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure) {
      return Result.fail(`Email validation failed: ${emailResult.getError()}`);
    }

    const passwordResult = Password.create(input.password);
    if (passwordResult.isFailure) {
      return Result.fail(`Password validation failed: ${passwordResult.getError()}`);
    }

    // Check user exists
    const userResult = await this.userRepo.findByEmail(emailResult.getValue().value);
    if (userResult.isFailure) {
      return Result.fail(`Database error: ${userResult.getError()}`);
    }

    const userOption = userResult.getValue();
    if (userOption.isNone()) {
      return Result.fail(DomainErrors.USER_NOT_FOUND);
    }

    // Attempt sign in
    const signInResult = await this.authProvider.signIn(
      userOption.unwrap(),
      passwordResult.getValue()
    );
    if (signInResult.isFailure) {
      return Result.fail(DomainErrors.INVALID_CREDENTIALS);
    }

    return Result.ok(this.toDto(signInResult.getValue()));
  }
}
```

### API Error Responses

```typescript
// src/adapters/controllers/base.controller.ts
export function handleError(error: string): NextResponse {
  // Map domain errors to HTTP status codes
  const statusMap: Record<string, number> = {
    [DomainErrors.USER_NOT_FOUND]: 404,
    [DomainErrors.EMAIL_ALREADY_EXISTS]: 409,
    [DomainErrors.INVALID_CREDENTIALS]: 401,
    [ApplicationErrors.UNAUTHORIZED]: 401,
    [ApplicationErrors.FORBIDDEN]: 403,
    [ApplicationErrors.VALIDATION_FAILED]: 400,
  };

  const status = statusMap[error] ?? 500;
  const formatted = formatDomainError(error);

  return NextResponse.json(
    { error: formatted },
    { status }
  );
}
```

### Console Error Formatting

```typescript
// For development debugging
export function logError(context: string, error: unknown): void {
  console.error(`
╔══════════════════════════════════════════════════════════════╗
║ ERROR in ${context.padEnd(49)}║
╠══════════════════════════════════════════════════════════════╣
║ ${String(error).substring(0, 60).padEnd(60)}║
╚══════════════════════════════════════════════════════════════╝
  `);
}
```

## Definition of Done

- [ ] Error constants defined
- [ ] VOs have clear messages
- [ ] UseCases wrap errors
- [ ] API returns formatted errors
