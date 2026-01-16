import { Option, Result, UUID } from "@packages/ddd-kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IDeleteConversationInputDto } from "@/application/dto/llm/delete-conversation.dto";
import type { IConversationRepository } from "@/application/ports/conversation.repository.port";
import type { IEventDispatcher } from "@/application/ports/event-dispatcher.port";
import { DeleteConversationUseCase } from "@/application/use-cases/llm/delete-conversation.use-case";
import { Conversation } from "@/domain/llm/conversation/conversation.aggregate";
import { ConversationDeletedEvent } from "@/domain/llm/conversation/events/conversation-deleted.event";
import { UserId } from "@/domain/user/user-id";

describe("DeleteConversationUseCase", () => {
  let useCase: DeleteConversationUseCase;
  let mockConversationRepository: IConversationRepository;
  let mockEventDispatcher: IEventDispatcher;

  const conversationId = new UUID<string>();
  const userId = "user-123";

  const validInput: IDeleteConversationInputDto = {
    conversationId: conversationId.value.toString(),
    userId,
  };

  const createMockConversation = (ownerId: string = userId): Conversation => {
    return Conversation.create(
      {
        userId: UserId.create(new UUID(ownerId)),
        title: Option.none(),
        metadata: Option.none(),
      },
      conversationId,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockConversationRepository = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findMany: vi.fn(),
      findBy: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      findByUserId: vi.fn(),
      getWithMessages: vi.fn(),
    };

    mockEventDispatcher = {
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      dispatch: vi.fn(),
      dispatchAll: vi.fn(),
      isSubscribed: vi.fn(),
      getHandlerCount: vi.fn(),
      clearHandlers: vi.fn(),
    };

    useCase = new DeleteConversationUseCase(
      mockConversationRepository,
      mockEventDispatcher,
    );
  });

  describe("happy path", () => {
    it("should delete conversation successfully", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.ok(mockConversation.id),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      expect(output.success).toBe(true);
      expect(output.deletedAt).toBeDefined();
      expect(typeof output.deletedAt).toBe("string");
    });

    it("should call repository delete with correct conversation ID", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.ok(mockConversation.id),
      );

      await useCase.execute(validInput);

      expect(mockConversationRepository.delete).toHaveBeenCalledTimes(1);
      const calledArg = vi.mocked(mockConversationRepository.delete).mock
        .calls[0]?.[0];
      expect(calledArg?.value.toString()).toBe(conversationId.value.toString());
    });
  });

  describe("ownership verification", () => {
    it("should fail when conversation belongs to different user", async () => {
      const mockConversation = createMockConversation("different-user");

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation access unauthorized");
      expect(mockConversationRepository.delete).not.toHaveBeenCalled();
    });

    it("should succeed when conversation belongs to requesting user", async () => {
      const mockConversation = createMockConversation(userId);

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.ok(mockConversation.id),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe("not found scenarios", () => {
    it("should fail when conversation is not found", async () => {
      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.none()),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Conversation not found");
      expect(mockConversationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("event dispatching", () => {
    it("should emit ConversationDeletedEvent after successful delete", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.ok(mockConversation.id),
      );

      await useCase.execute(validInput);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledTimes(1);
      const dispatchedEvent = vi.mocked(mockEventDispatcher.dispatch).mock
        .calls[0]?.[0];
      expect(dispatchedEvent).toBeInstanceOf(ConversationDeletedEvent);
    });

    it("should include correct data in ConversationDeletedEvent", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.ok(mockConversation.id),
      );

      await useCase.execute(validInput);

      const dispatchedEvent = vi.mocked(mockEventDispatcher.dispatch).mock
        .calls[0]?.[0] as ConversationDeletedEvent;
      expect(dispatchedEvent.payload.conversationId).toBe(
        conversationId.value.toString(),
      );
      expect(dispatchedEvent.payload.userId).toBe(userId);
      expect(dispatchedEvent.eventType).toBe("conversation.deleted");
    });

    it("should not emit event when delete fails", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.fail("Delete failed"),
      );

      await useCase.execute(validInput);

      expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("should not emit event when ownership verification fails", async () => {
      const mockConversation = createMockConversation("different-user");

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      await useCase.execute(validInput);

      expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should fail when findById returns error", async () => {
      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.fail("Database connection error"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Database connection error");
    });

    it("should fail when delete returns error", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.fail("Delete operation failed"),
      );

      const result = await useCase.execute(validInput);

      expect(result.isFailure).toBe(true);
      expect(result.getError()).toBe("Delete operation failed");
    });
  });

  describe("output format", () => {
    it("should return ISO date string for deletedAt", async () => {
      const mockConversation = createMockConversation();

      vi.mocked(mockConversationRepository.findById).mockResolvedValue(
        Result.ok(Option.some(mockConversation)),
      );

      vi.mocked(mockConversationRepository.delete).mockResolvedValue(
        Result.ok(mockConversation.id),
      );

      const result = await useCase.execute(validInput);

      expect(result.isSuccess).toBe(true);
      const output = result.getValue();
      const parsedDate = new Date(output.deletedAt);
      expect(parsedDate.toString()).not.toBe("Invalid Date");
    });
  });
});
