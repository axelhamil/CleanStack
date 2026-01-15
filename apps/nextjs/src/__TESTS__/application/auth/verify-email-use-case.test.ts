import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAuthProvider } from "@/application/ports/auth.service.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import type { IUserRepository } from "@/application/ports/user.repository.port";
import { VerifyEmailUseCase } from "@/application/use-cases/auth/verify-email.use-case";
import { UserEmailVerifiedEvent } from "@/domain/user/events/user-verified.event";
import { User } from "@/domain/user/user.aggregate";
import { Email } from "@/domain/user/value-objects/email.vo";
import { Name } from "@/domain/user/value-objects/name.vo";

describe("VerifyEmailUseCase", () => {
  let useCase: VerifyEmailUseCase;
  let mockUserRepo: IUserRepository;
  let mockAuthProvider: IAuthProvider;
  let mockEventDispatcher: IEventDispatcher;

  const userId = new UUID<string>("test-user-id");

  const createMockUser = () => {
    const user = User.create(
      {
        email: Email.create("test@example.com" as string).getValue(),
        name: Name.create("John Doe" as string).getValue(),
        image: Option.none(),
      },
      userId,
    );
    user.clearEvents();
    return user;
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

    useCase = new VerifyEmailUseCase(
      mockUserRepo,
      mockAuthProvider,
      mockEventDispatcher,
    );
  });

  describe("execute()", () => {
    describe("happy path", () => {
      it("should return success when email is verified", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        const result = await useCase.execute({ userId: userId.value });

        expect(result.isSuccess).toBe(true);
      });

      it("should call findById with correct user id", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockUserRepo.findById).toHaveBeenCalledWith(
          expect.objectContaining({ value: userId.value }),
        );
      });

      it("should update user after verification", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockUserRepo.update).toHaveBeenCalled();
      });

      it("should dispatch domain events", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledWith(
          expect.arrayContaining([expect.any(UserEmailVerifiedEvent)]),
        );
      });

      it("should call authProvider.verifyEmail", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockAuthProvider.verifyEmail).toHaveBeenCalledWith(userId.value);
      });

      it("should mark user as verified", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockUser.get("emailVerified")).toBe(true);
      });
    });

    describe("user not found", () => {
      it("should fail when user does not exist", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.none()),
        );

        const result = await useCase.execute({ userId: userId.value });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("User not found");
      });

      it("should not call update when user not found", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.none()),
        );

        await useCase.execute({ userId: userId.value });

        expect(mockUserRepo.update).not.toHaveBeenCalled();
      });

      it("should not dispatch events when user not found", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.none()),
        );

        await useCase.execute({ userId: userId.value });

        expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
      });
    });

    describe("already verified", () => {
      it("should fail when user is already verified", async () => {
        const mockUser = createMockUser();
        mockUser.verify();
        mockUser.clearEvents();

        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );

        const result = await useCase.execute({ userId: userId.value });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("User is already verified");
      });

      it("should not call update when already verified", async () => {
        const mockUser = createMockUser();
        mockUser.verify();
        mockUser.clearEvents();

        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );

        await useCase.execute({ userId: userId.value });

        expect(mockUserRepo.update).not.toHaveBeenCalled();
      });
    });

    describe("repository errors", () => {
      it("should fail when findById returns error", async () => {
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.fail("Database connection error"),
        );

        const result = await useCase.execute({ userId: userId.value });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Database connection error");
      });

      it("should fail when update returns error", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(
          Result.fail("Update failed"),
        );

        const result = await useCase.execute({ userId: userId.value });

        expect(result.isFailure).toBe(true);
        expect(result.getError()).toBe("Update failed");
      });

      it("should not dispatch events when update fails", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(
          Result.fail("Update failed"),
        );

        await useCase.execute({ userId: userId.value });

        expect(mockEventDispatcher.dispatchAll).not.toHaveBeenCalled();
      });
    });

    describe("event dispatching", () => {
      it("should clear events after dispatching", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockUser.domainEvents).toHaveLength(0);
      });

      it("should dispatch UserEmailVerifiedEvent with correct data", async () => {
        const mockUser = createMockUser();
        vi.mocked(mockUserRepo.findById).mockResolvedValue(
          Result.ok(Option.some(mockUser)),
        );
        vi.mocked(mockUserRepo.update).mockResolvedValue(Result.ok(mockUser));
        vi.mocked(mockAuthProvider.verifyEmail).mockResolvedValue(Result.ok());

        await useCase.execute({ userId: userId.value });

        expect(mockEventDispatcher.dispatchAll).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              eventType: "user.email_verified",
              aggregateId: userId.value,
            }),
          ]),
        );
      });
    });
  });
});
