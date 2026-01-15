import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import { SignOutUseCase } from "@/application/use-cases/auth/sign-out.use-case";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("SignOutUseCase", () => {
  let useCase: SignOutUseCase;
  let mockAuthProvider: IAuthProvider;
  let mockHeaders: Headers;

  const mockUser = User.create({
    email: Email.create("test@example.com" as string).getValue(),
    name: Name.create("John Doe" as string).getValue(),
    image: Option.none(),
  });

  const mockSession: AuthSession = {
    user: mockUser,
    session: {
      id: "session-123",
      token: "test-token",
      expiresAt: new Date("2025-12-31"),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthProvider = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      verifyEmail: vi.fn(),
    };

    mockHeaders = new Headers();
    useCase = new SignOutUseCase(mockAuthProvider);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return success when user is logged out", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        const result = await useCase.execute(mockHeaders);

        expect(result.isSuccess).toBe(true);
      });

      it("should call getSession to verify active session", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        await useCase.execute(mockHeaders);

        expect(mockAuthProvider.getSession).toHaveBeenCalledWith(mockHeaders);
      });

      it("should call signOut with headers", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        await useCase.execute(mockHeaders);

        expect(mockAuthProvider.signOut).toHaveBeenCalledWith(mockHeaders);
      });

      it("should return user and session data in output", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        const result = await useCase.execute(mockHeaders);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.user.email).toBe("test@example.com");
        expect(output.user.name).toBe("John Doe");
        expect(output.session.id).toBe("session-123");
        expect(output.session.token).toBe("test-token");
      });
    });

    describe("no active session", () => {
      it("should fail when no session exists", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.none()),
        );

        const result = await useCase.execute(mockHeaders);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("No active session found");
      });

      it("should not call signOut when no session", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.none()),
        );

        await useCase.execute(mockHeaders);

        expect(mockAuthProvider.signOut).not.toHaveBeenCalled();
      });
    });

    describe("getSession failure", () => {
      it("should fail when getSession returns error", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.fail("Session service unavailable"),
        );

        const result = await useCase.execute(mockHeaders);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Session service unavailable");
      });

      it("should not call signOut when getSession fails", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.fail("Session error"),
        );

        await useCase.execute(mockHeaders);

        expect(mockAuthProvider.signOut).not.toHaveBeenCalled();
      });
    });

    describe("signOut failure", () => {
      it("should fail when signOut returns error", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(
          Result.fail("Sign out failed"),
        );

        const result = await useCase.execute(mockHeaders);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Sign out failed");
      });
    });

    describe("DTO mapping", () => {
      it("should map user data correctly", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        const result = await useCase.execute(mockHeaders);

        const output = result.getValue();
        expect(output.user.id).toBeDefined();
        expect(output.user.email).toBe("test@example.com");
        expect(output.user.name).toBe("John Doe");
        expect(output.user.emailVerified).toBe(false);
      });

      it("should map session data correctly", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        const result = await useCase.execute(mockHeaders);

        const output = result.getValue();
        expect(output.session.id).toBe("session-123");
        expect(output.session.token).toBe("test-token");
        expect(output.session.expiresAt).toEqual(new Date("2025-12-31"));
      });

      it("should handle null image", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );
        vi.mocked(mockAuthProvider.signOut).mockResolvedValue(Result.ok());

        const result = await useCase.execute(mockHeaders);

        const output = result.getValue();
        expect(output.user.image).toBeNull();
      });
    });
  });
});
