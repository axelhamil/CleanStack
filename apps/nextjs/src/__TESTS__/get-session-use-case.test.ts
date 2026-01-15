import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthSession,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import { GetSessionUseCase } from "@/application/use-cases/auth/get-session.use-case";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("GetSessionUseCase", () => {
  let useCase: GetSessionUseCase;
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
    useCase = new GetSessionUseCase(mockAuthProvider);
  });

  describe("execute()", () => {
    describe("session exists", () => {
      it("should return Some with session data when session exists", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );

        const result = await useCase.execute(mockHeaders);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().isSome()).toBe(true);
      });

      it("should call getSession with headers", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );

        await useCase.execute(mockHeaders);

        expect(mockAuthProvider.getSession).toHaveBeenCalledWith(mockHeaders);
      });

      it("should map user data correctly", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );

        const result = await useCase.execute(mockHeaders);

        const session = result.getValue().unwrap();
        expect(session.user.email).toBe("test@example.com");
        expect(session.user.name).toBe("John Doe");
        expect(session.user.emailVerified).toBe(false);
      });

      it("should map session data correctly", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );

        const result = await useCase.execute(mockHeaders);

        const session = result.getValue().unwrap();
        expect(session.session.id).toBe("session-123");
        expect(session.session.token).toBe("test-token");
        expect(session.session.expiresAt).toEqual(new Date("2025-12-31"));
      });

      it("should handle null image", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );

        const result = await useCase.execute(mockHeaders);

        const session = result.getValue().unwrap();
        expect(session.user.image).toBeNull();
      });

      it("should handle user with image", async () => {
        const userWithImage = User.create({
          email: Email.create("test@example.com" as string).getValue(),
          name: Name.create("John Doe" as string).getValue(),
          image: Option.some("https://example.com/avatar.png"),
        });

        const sessionWithImage: AuthSession = {
          user: userWithImage,
          session: mockSession.session,
        };

        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(sessionWithImage)),
        );

        const result = await useCase.execute(mockHeaders);

        const session = result.getValue().unwrap();
        expect(session.user.image).toBe("https://example.com/avatar.png");
      });
    });

    describe("no session", () => {
      it("should return None when no session exists", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.none()),
        );

        const result = await useCase.execute(mockHeaders);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue().isNone()).toBe(true);
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

      it("should propagate error message from auth provider", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.fail("Invalid token"),
        );

        const result = await useCase.execute(mockHeaders);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Invalid token");
      });
    });

    describe("DTO mapping", () => {
      it("should include user id as string", async () => {
        vi.mocked(mockAuthProvider.getSession).mockResolvedValue(
          Result.ok(Option.some(mockSession)),
        );

        const result = await useCase.execute(mockHeaders);

        const session = result.getValue().unwrap();
        expect(typeof session.user.id).toBe("string");
        expect(session.user.id).toBeDefined();
      });
    });
  });
});
