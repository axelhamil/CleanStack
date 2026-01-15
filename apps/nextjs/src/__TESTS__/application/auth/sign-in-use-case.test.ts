import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthResponse,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { SignInUseCase } from "@/application/use-cases/auth/sign-in.use-case";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("SignInUseCase", () => {
  let useCase: SignInUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;

  const validInput = {
    email: "test@example.com",
    password: "password123",
    rememberMe: false,
  };

  const mockUser = User.create({
    email: Email.create("test@example.com" as string).getValue(),
    name: Name.create("John Doe" as string).getValue(),
    image: Option.none(),
  });

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: "test-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUserRepo = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
    };

    mockAuthProvider = {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      verifyEmail: vi.fn(),
    };

    useCase = new SignInUseCase(mockUserRepo, mockAuthProvider);
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return success with user data when credentials are valid", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
          Result.ok(mockAuthResponse),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual({
          user: expect.objectContaining({
            email: "test@example.com",
            name: "John Doe",
          }),
          token: "test-token",
        });
      });

      it("should call auth provider with correct arguments", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
          Result.ok(mockAuthResponse),
        );

        await useCase.execute(validInput);

        expect(mockAuthProvider.signIn).toHaveBeenCalledWith(
          mockUser,
          expect.any(Object),
          false,
        );
      });

      it("should pass rememberMe flag to auth provider", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
          Result.ok(mockAuthResponse),
        );

        await useCase.execute({ ...validInput, rememberMe: true });

        expect(mockAuthProvider.signIn).toHaveBeenCalledWith(
          mockUser,
          expect.any(Object),
          true,
        );
      });
    });

    describe("validation errors", () => {
      it("should fail when email is invalid", async () => {
        const result = await useCase.execute({
          ...validInput,
          email: "invalid-email",
        });

        expect(result.isFailure).toBe(true);
        expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
      });

      it("should fail when password is too short", async () => {
        const result = await useCase.execute({
          ...validInput,
          password: "123",
        });

        expect(result.isFailure).toBe(true);
        expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
      });

      it("should fail when email is empty", async () => {
        const result = await useCase.execute({
          ...validInput,
          email: "",
        });

        expect(result.isFailure).toBe(true);
      });

      it("should fail when password is empty", async () => {
        const result = await useCase.execute({
          ...validInput,
          password: "",
        });

        expect(result.isFailure).toBe(true);
      });
    });

    describe("user not found", () => {
      it("should fail when user does not exist", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.none()),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Email not found");
      });

      it("should not call auth provider when user not found", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.none()),
        );

        await useCase.execute(validInput);

        expect(mockAuthProvider.signIn).not.toHaveBeenCalled();
      });
    });

    describe("authentication failure", () => {
      it("should fail when password is incorrect", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
          Result.fail("Invalid credentials"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Invalid credentials");
      });

      it("should fail when auth provider returns error", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
          Result.fail("Authentication service unavailable"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Authentication service unavailable");
      });
    });

    describe("repository errors", () => {
      it("should fail when repository returns error", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        const result = await useCase.execute(validInput);

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Database connection error");
      });
    });

    describe("DTO mapping", () => {
      it("should map user data correctly to output DTO", async () => {
        vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockAuthProvider.signIn).mockResolvedValue(
          Result.ok(mockAuthResponse),
        );

        const result = await useCase.execute(validInput);

        expect(result.isSuccess).toBe(true);
        const output = result.getValue();
        expect(output.user.id).toBeDefined();
        expect(output.user.email).toBe("test@example.com");
        expect(output.user.name).toBe("John Doe");
        expect(output.user.emailVerified).toBe(false);
        expect(output.token).toBe("test-token");
      });
    });
  });
});
