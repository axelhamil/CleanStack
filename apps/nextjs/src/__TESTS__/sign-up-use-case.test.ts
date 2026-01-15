import { Option, Result } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AuthResponse,
  IAuthProvider,
} from "@/application/ports/auth.service.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { SignUpUseCase } from "@/application/use-cases/auth/sign-up.use-case";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("SignUpUseCase", () => {
  let useCase: SignUpUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;
  let mockEventDispatcher: IEventDispatcher;

  const validInput = {
    email: "test@example.com",
    password: "password123",
    name: "John Doe",
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

    mockEventDispatcher = {
      subscribe: vi.fn().mockReturnValue(Result.ok()),
      unsubscribe: vi.fn().mockReturnValue(Result.ok()),
      dispatch: vi.fn().mockResolvedValue(Result.ok()),
      dispatchAll: vi.fn().mockResolvedValue(Result.ok()),
      isSubscribed: vi.fn().mockReturnValue(false),
      getHandlerCount: vi.fn().mockReturnValue(0),
      clearHandlers: vi.fn(),
    };

    useCase = new SignUpUseCase(
      mockUserRepo,
      mockAuthProvider,
      mockEventDispatcher,
    );
  });

  describe("execute()", () => {
    it("should dispatch events after successful signup", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockAuthProvider.signUp).mockResolvedValue(
        Result.ok(mockAuthResponse),
      );

      await useCase.execute(validInput);

      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledTimes(1);
      expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: "user.created",
            payload: expect.objectContaining({
              email: "test@example.com",
              name: "John Doe",
            }),
          }),
        ]),
      );
    });

    it("should not dispatch events when signup fails", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockAuthProvider.signUp).mockResolvedValue(
        Result.fail("Auth error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });

    it("should not dispatch events when email is taken", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.some(mockUser)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Email already registered");
      expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
    });

    it("should return success with user data", async () => {
      vi.mocked(mockUserRepo.findByEmail).mockResolvedValue(
        Result.ok(Option.none()),
      );
      vi.mocked(mockAuthProvider.signUp).mockResolvedValue(
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

    it("should fail on invalid email", async () => {
      const result = await useCase.execute({
        ...validInput,
        email: "invalid",
      });

      expect(result.isFailure).toBe(true);
    });

    it("should fail on invalid name", async () => {
      const result = await useCase.execute({
        ...validInput,
        name: "",
      });

      expect(result.isFailure).toBe(true);
    });
  });
});
