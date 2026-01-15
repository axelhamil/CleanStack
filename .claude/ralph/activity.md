# Module LLM Plug & Play - Activity Log

## Current Status

**Project:** Module LLM Plug & Play
**Started:** 2026-01-15
**Last Updated:** 2026-01-15
**Tasks Completed:** 22/65
**Current Task:** [TDD] Write StreamCompletionUseCase tests FIRST

---

## Progress Summary

| Category | Status |
|----------|--------|
| Setup | ✅ Complete |
| Domain | 🔄 In Progress |
| Application | 🔄 In Progress |
| Adapters | ⏳ Pending |
| Infrastructure | 🔄 In Progress |
| UI | ⏳ Pending |
| Testing | ⏳ Pending |
| Verification | ⏳ Pending |

---

## Reference Documents

- **PRD:** `.claude/ralph/PRD.md`
- **Plan:** `.claude/ralph/plan.md`
- **Agent Prompt:** `.claude/ralph/PROMPT.md`

## Acceptance Criteria (MANDATORY)

- [ ] All tests written and passing
- [ ] `pnpm check:all` passes without errors
- [ ] Test coverage >= 90% for LLM module
- [ ] `pnpm check:duplication` passes
- [ ] `pnpm check:unused` passes
- [ ] All features work in browser (chat, admin prompts, usage dashboard)

---

## Session Log

<!-- Agent appends dated entries below this line -->

### 2026-01-15 - Task 1: Create LLM module directory structure

**Completed:** ✅

**Changes:**
- Created `src/domain/llm/conversation/` with subdirectories (entities, events, value-objects)
- Created `src/domain/llm/prompt/` with subdirectories (events, value-objects)
- Created `src/domain/llm/usage/` with subdirectories (events, value-objects)
- Created `src/domain/llm/prompts/` for domain prompts
- Created `src/application/use-cases/llm/` with `managed-prompts/` subdirectory
- Created `src/application/dto/llm/`
- Created `src/adapters/llm/`

**Commands Run:**
- `mkdir -p` for all directories
- `pnpm type-check` - PASSED

**Verification:**
- All directories created successfully
- Type check passes

### 2026-01-15 - Task 2: Add LLM database schema

**Completed:** ✅

**Changes:**
- Schema already existed in `packages/drizzle/src/schema/llm.ts`
- Verified enums: messageRoleEnum, providerEnum, environmentEnum
- Verified tables: conversation, message, managedPrompt, llmUsage
- All indexes defined for userId+createdAt, provider+model
- Exported from `packages/drizzle/src/schema/index.ts`
- Pushed schema to database (already up to date)

**Commands Run:**
- `pnpm drizzle-kit push` - "No changes detected" (already synced)
- `pnpm type-check` - PASSED

**Verification:**
- Schema matches PRD requirements
- Database schema is in sync

### 2026-01-15 - Task 3: Implement Conversation aggregate ID

**Completed:** ✅

**Changes:**
- Created `src/domain/llm/conversation/conversation-id.ts`
- Extended UUID from ddd-kit
- Added static create() method following UserId pattern

**Commands Run:**
- `pnpm type-check` - PASSED

**Verification:**
- Type check passes

### 2026-01-15 - Task 4: Implement Conversation value objects

**Completed:** ✅

**Changes:**
- Created `ConversationTitle` VO (1-200 chars, trimmed)
- Created `ConversationMetadata` VO (JSON object, nullable)
- Both use Zod validation

**Commands Run:**
- `pnpm type-check` - PASSED

**Verification:**
- Type check passes

### 2026-01-15 - Task 5: Implement Message entity

**Completed:** ✅

**Changes:**
- Created `MessageId` in entities/message-id.ts
- Created `MessageRole` VO (enum: user, assistant, system)
- Created `MessageContent` VO (non-empty string)
- Created `TokenUsage` VO (inputTokens, outputTokens, totalTokens)
- Created `Cost` VO (amount, currency)
- Created `Message` entity with all properties

**Commands Run:**
- `pnpm type-check` - PASSED

**Verification:**
- Type check passes

### 2026-01-15 - Refactoring: Services folder + Minimal getters pattern

**Completed:** ✅

**Changes:**
- Moved adapter services (auth, email, payment, llm) into `adapters/services/` folder
- Updated CLAUDE.md with new services folder structure
- Updated DI modules import paths (auth.module.ts, email.module.ts, billing.module.ts)
- Documented "Only `get id()` getter" pattern in CLAUDE.md
- Refactored LLM domain events to use `entity.get('propName')` instead of custom getters
- Updated events: message-added, completion-received, conversation-created, conversation-deleted

**Pattern Change:**
```typescript
// Before: custom getters
get role(): MessageRole { return this._props.role; }

// After: use inherited get() method
const role = message.get("role");
```

**Commands Run:**
- `pnpm type-check` - PASSED

**Verification:**
- All imports updated
- Type check passes
- CLAUDE.md updated with rule 9 and Entity & Aggregate section

### 2026-01-15 - Task 7: [TDD] Write Conversation VO tests + Fix implementations

**Completed:** ✅

**TDD Workflow:** RED → GREEN → REFACTOR

**Changes:**
- Created `src/domain/llm/conversation/__tests__/conversation-title.vo.test.ts` (9 tests)
- Created `src/domain/llm/conversation/__tests__/conversation-metadata.vo.test.ts` (9 tests)
- Fixed TypeScript type inference issues with `as string` and `as ConversationMetadataValue` assertions

**RED Phase (4 failing tests):**
1. ConversationTitle - trim not applied to stored value
2. ConversationTitle - whitespace-only passes validation
3. ConversationMetadata - equals() fails for objects (reference comparison)
4. ConversationMetadata - equals() fails for empty objects

**GREEN Phase Fixes:**
- `ConversationTitle`: Override constructor to trim before storing, reorder Zod schema to transform→refine
- `ConversationMetadata`: Override `equals()` method for deep JSON comparison

**Commands Run:**
- `pnpm type-check` - PASSED
- `pnpm test` - 310 tests PASSED (18 new tests)

**Verification:**
- All 18 Conversation VO tests pass
- No regressions on existing 292 tests
- Type check passes

### 2026-01-15 - Task 8: [TDD] Write Message entity tests + Fix implementations

**Completed:** ✅

**TDD Workflow:** RED → GREEN → REFACTOR

**Changes:**
- Created `src/domain/llm/conversation/__tests__/message-role.vo.test.ts` (11 tests)
- Created `src/domain/llm/conversation/__tests__/message-content.vo.test.ts` (8 tests)
- Created `src/domain/llm/conversation/__tests__/token-usage.vo.test.ts` (12 tests)
- Created `src/domain/llm/conversation/__tests__/cost.vo.test.ts` (13 tests)
- Created `src/domain/llm/conversation/__tests__/message.entity.test.ts` (13 tests)

**RED Phase (2 failing tests):**
1. TokenUsage.equals() - fails for objects (reference comparison)
2. Cost.equals() - fails for objects (reference comparison)

**GREEN Phase Fixes:**
- `TokenUsage`: Override `equals()` method for field-by-field comparison
- `Cost`: Override `equals()` method for field-by-field comparison

**Commands Run:**
- `pnpm type-check` - PASSED
- `pnpm test` - 367 tests PASSED (57 new tests)

**Verification:**
- All 57 Message entity/VO tests pass
- No regressions on existing tests
- Type check passes

### 2026-01-15 - Task 9: [TDD] Write Conversation aggregate tests

**Completed:** ✅

**TDD Workflow:** All tests passed immediately (GREEN)

**Changes:**
- Created `src/domain/llm/conversation/__tests__/conversation.aggregate.test.ts` (20 tests)
  - create(): creates aggregate, emits event, respects provided ID
  - reconstitute(): restores without events
  - updateTitle(): updates title and updatedAt
  - updateMetadata(): updates metadata and updatedAt
  - markUpdated(): sets updatedAt
  - id getter returns ConversationId

**Commands Run:**
- `pnpm test` - 387 tests PASSED (20 new tests)

**Verification:**
- All Conversation aggregate tests pass
- No regressions on existing tests

### 2026-01-15 - Task 10: [TDD] Write Domain Events tests FIRST

**Completed:** ✅

**TDD Workflow:** RED → GREEN (property name fix)

**Changes:**
- Created `src/domain/llm/conversation/__tests__/conversation-created.event.test.ts` (12 tests)
  - Tests eventType, aggregateId, payload fields (conversationId, userId, title)
  - Tests event creation (instance, dateOccurred, uniqueness)
- Created `src/domain/llm/conversation/__tests__/message-added.event.test.ts` (16 tests)
  - Tests eventType, aggregateId, payload fields (conversationId, messageId, role, content, model)
  - Tests for different message roles (user, assistant, system)
- Created `src/domain/llm/conversation/__tests__/completion-received.event.test.ts` (19 tests)
  - Tests eventType, aggregateId
  - Tests payload with token usage (inputTokens, outputTokens, totalTokens)
  - Tests payload with cost (amount, currency)
  - Tests full completion event with all data

**RED Phase (6 failing tests):**
1. Tests used `occurredOn` but BaseDomainEvent uses `dateOccurred`
2. Tests used `eventId` but BaseDomainEvent doesn't have this property

**GREEN Phase Fixes:**
- Changed `occurredOn` to `dateOccurred` in all event tests
- Changed `eventId` uniqueness test to `aggregateId` or instance comparison

**Commands Run:**
- `pnpm test` - 433 tests PASSED (46 new tests)

**Verification:**
- All domain event tests pass
- No regressions on existing tests

### 2026-01-15 - Task 11: [IMPL] Make Conversation domain tests pass (GREEN)

**Completed:** ✅

**Note:** This task was already completed during the TDD cycles (Tasks 7-10). All fixes were made during the RED→GREEN phases:
- Task 7: Fixed ConversationTitle (trim), ConversationMetadata (equals override)
- Task 8: Fixed TokenUsage (equals override), Cost (equals override)
- Tasks 9-10: All tests passed immediately

**Commands Run:**
- `pnpm test` - 433 tests PASSED

**Verification:**
- All conversation domain tests pass
- No implementation fixes needed

### 2026-01-15 - Task 12: [TDD] Write ManagedPrompt VO tests FIRST

**Completed:** ✅

**TDD Workflow:** RED → GREEN

**Changes:**
- Created 6 Value Object implementations in `src/domain/llm/prompt/value-objects/`:
  - `prompt-key.vo.ts` - Slug format validation (lowercase, hyphens, max 100 chars)
  - `prompt-name.vo.ts` - Display name (1-200 chars, trimmed)
  - `prompt-description.vo.ts` - Optional description (max 1000 chars)
  - `prompt-template.vo.ts` - Template with {{variables}}, extractVariables(), render()
  - `prompt-variable.vo.ts` - Variable definition (name, type, required, defaultValue)
  - `prompt-environment.vo.ts` - Enum: development | staging | production
- Created 6 test files in `src/domain/llm/prompt/__tests__/`:
  - `prompt-key.vo.test.ts` (16 tests)
  - `prompt-name.vo.test.ts` (11 tests)
  - `prompt-description.vo.test.ts` (11 tests)
  - `prompt-template.vo.test.ts` (22 tests)
  - `prompt-variable.vo.test.ts` (18 tests)
  - `prompt-environment.vo.test.ts` (17 tests)

**RED Phase (16 failing tests):**
- All VOs used `result.error.errors[0].message` but Zod can have undefined errors
- Pattern mismatch with existing codebase VOs

**GREEN Phase Fixes:**
- Changed all VOs to use `result.error.issues[0]?.message ?? "default message"` pattern
- Follows existing codebase convention (email.vo, password.vo, cost.vo, etc.)

**Commands Run:**
- `pnpm test` - 528 tests PASSED (95 new tests)

**Verification:**
- All ManagedPrompt VO tests pass
- No regressions on existing tests

### 2026-01-15 - Task 13: [TDD] Write ManagedPrompt aggregate tests FIRST

**Completed:** ✅

**TDD Workflow:** All tests passed immediately (GREEN)

**Changes:**
- Created `src/domain/llm/prompt/managed-prompt-id.ts` - ID class extending UUID
- Created 4 domain events in `src/domain/llm/prompt/events/`:
  - `managed-prompt-created.event.ts` - Emitted on create()
  - `managed-prompt-updated.event.ts` - Emitted on updateContent() with version tracking
  - `managed-prompt-activated.event.ts` - Emitted on activate()
  - `managed-prompt-deactivated.event.ts` - Emitted on deactivate()
- Created `src/domain/llm/prompt/managed-prompt.aggregate.ts` - Full aggregate with:
  - create() / reconstitute() static methods
  - updateContent() - increments version, emits event
  - activate() / deactivate() - toggle isActive with events
  - render() - variable substitution with validation
  - changeEnvironment() - environment switching
- Created `src/domain/llm/prompt/__tests__/managed-prompt.aggregate.test.ts` (28 tests)
  - Tests for create(), reconstitute(), updateContent(), activate(), deactivate()
  - Tests for render() with required/optional variables and defaults
  - Tests for changeEnvironment()

**Commands Run:**
- `pnpm test` - 556 tests PASSED (28 new tests)

**Verification:**
- All ManagedPrompt aggregate tests pass
- No regressions on existing tests
- Implementation follows existing aggregate patterns (User, Conversation)

### 2026-01-15 - Task 14: [IMPL] Implement ManagedPrompt VOs and aggregate (GREEN)

**Completed:** ✅

**Note:** This task was already completed during Task 12 and Task 13. All VOs and aggregate were implemented during the TDD cycle:
- Task 12: Implemented all 6 VOs (PromptKey, PromptName, PromptDescription, PromptTemplate, PromptVariable, PromptEnvironment)
- Task 13: Implemented ManagedPrompt aggregate, ManagedPromptId, and all 4 domain events

**Commands Run:**
- `pnpm test` - 556 tests PASSED

**Verification:**
- All ManagedPrompt tests pass (GREEN)
- No implementation fixes needed

### 2026-01-15 - Task 15: [TDD] Write LLMUsage tests FIRST

**Completed:** ✅

**TDD Workflow:** RED → GREEN

**Changes:**
- Created 5 test files in `src/domain/llm/usage/__tests__/`:
  - `llm-usage.aggregate.test.ts` (12 tests) - aggregate create, reconstitute, events, totalTokens
  - `provider-identifier.vo.test.ts` (12 tests) - valid providers, invalid providers, helpers
  - `model-identifier.vo.test.ts` (10 tests) - valid models, invalid models, equality
  - `token-count.vo.test.ts` (11 tests) - positive integers, add(), zero()
  - `duration.vo.test.ts` (13 tests) - positive milliseconds, toSeconds(), toHumanReadable()

**RED Phase (TypeScript type inference issues):**
- `ValueObject.create()` generic inferred literal types (e.g., `100` instead of `number`)
- Caused error: "The 'this' context of type 'typeof TokenCount' is not assignable to method's 'this' of type 'new (value: 100) => ValueObject<100>'"

**GREEN Phase Fixes:**
- Applied `as Type` pattern from existing codebase (`user-domain.test.ts`)
- Changed all test values to use type assertions:
  - `TokenCount.create(100 as number)`
  - `Duration.create(1500 as number)`
  - `ModelIdentifier.create("gpt-4o" as string)`
  - `ProviderIdentifier.create("openai" as ProviderType)`

**Commands Run:**
- `pnpm type-check` - PASSED
- `pnpm test` - 614 tests PASSED (58 new LLMUsage tests)

**Verification:**
- All LLMUsage tests pass
- No regressions on existing tests
- Type check passes

### 2026-01-15 - Task 16: [IMPL] Implement LLMUsage domain (GREEN)

**Completed:** ✅

**Note:** Most implementation was already done during Task 15. This task completed the remaining items.

**Changes:**
- Verified existing files in `src/domain/llm/usage/`:
  - `llm-usage-id.ts` - LLMUsageId class extending UUID ✓
  - `value-objects/provider-identifier.vo.ts` - openai, anthropic, google ✓
  - `value-objects/model-identifier.vo.ts` - model string validation ✓
  - `value-objects/token-count.vo.ts` - non-negative integers ✓
  - `value-objects/duration.vo.ts` - milliseconds duration ✓
  - `llm-usage.aggregate.ts` - LLMUsage aggregate ✓
  - `events/usage-recorded.event.ts` - UsageRecordedEvent ✓
- Created 2 new budget events in `src/domain/llm/usage/events/`:
  - `budget-threshold-reached.event.ts` - emitted when usage approaches budget threshold
  - `budget-exceeded.event.ts` - emitted when budget is exceeded

**Commands Run:**
- `pnpm type-check` - PASSED
- `pnpm test` - 614 tests PASSED (GREEN)

**Verification:**
- All LLMUsage domain tests pass
- Type check passes
- Implementation complete per plan requirements

### 2026-01-15 - Task 17: [TDD] Write DomainPrompt tests FIRST

**Completed:** ✅

**TDD Workflow:** RED phase (tests written, implementation pending)

**Changes:**
- Created `src/domain/llm/prompts/__tests__/domain-prompt.test.ts` (15 tests)
  - Tests for render() with single/multiple/repeated variables
  - Tests for missing variable failure
  - Tests for templates with no variables
  - Tests for ignoring extra variables
  - Tests for getVariables() extraction
  - Tests for properties (key, template)
  - Tests for static prompts (SYSTEM_DEFAULT, ERROR_GENERIC, CONVERSATION_TITLE_GENERATOR)

**Commands Run:**
- `pnpm test` - Tests fail as expected (RED phase)

**Verification:**
- Tests written first following TDD workflow
- Ready for GREEN phase (Task 18)

### 2026-01-15 - Task 18: [IMPL] Implement DomainPrompt (GREEN)

**Completed:** ✅

**TDD Workflow:** GREEN phase (all tests pass)

**Changes:**
- Created `src/domain/llm/prompts/domain-prompt.ts`
  - DomainPrompt class with key, template properties
  - getVariables() method using regex to extract {{variable}} patterns
  - render() method with variable substitution and missing variable validation
  - Static prompts: SYSTEM_DEFAULT, ERROR_GENERIC, CONVERSATION_TITLE_GENERATOR

**Commands Run:**
- `pnpm test` - 629 tests PASSED (15 new tests)

**Verification:**
- All 15 DomainPrompt tests pass
- No regressions on existing tests
- Domain layer complete

### 2026-01-15 - Task 19: Create LLM port interfaces

**Completed:** ✅

**Changes:**
- Created `src/application/ports/llm.provider.port.ts`
  - ILLMProvider interface with generateText(), streamText(), estimateTokens(), getAvailableModels()
  - Supporting interfaces: ILLMMessage, IGenerateTextParams, IGenerateTextResponse, IStreamTextParams, IStreamTextResponse, IModelConfig
- Created `src/application/ports/conversation.repository.port.ts`
  - IConversationRepository extending BaseRepository with findByUserId(), getWithMessages()
  - IConversationWithMessages interface
- Created `src/application/ports/message.repository.port.ts`
  - IMessageRepository extending BaseRepository with findByConversationId(), countByConversationId()
- Created `src/application/ports/managed-prompt.repository.port.ts`
  - IManagedPromptRepository extending BaseRepository with findByKey(), findActiveByKey(), getVersionHistory(), activateVersion()
- Created `src/application/ports/llm-usage.repository.port.ts`
  - ILLMUsageRepository extending BaseRepository with getTotalCostByUser(), getTotalCostGlobal(), getUsageStats()
  - IUsageStatsParams, IUsageStatsBreakdown, IUsageStats interfaces
- Created `src/application/ports/model-router.port.ts`
  - IModelRouter interface with selectOptimalModel(), getModelConfig(), getAllModels()
  - ISelectModelParams, ISelectedModel interfaces

**Commands Run:**
- `pnpm type-check` - PASSED

**Verification:**
- All 6 port interfaces created
- Type check passes
- Application layer ports ready for use cases

### 2026-01-15 - Task 20: Create all DTOs

**Completed:** ✅

**Changes:**
- Created `src/application/dto/llm/common.dto.ts`
  - Shared schemas: providerSchema, messageRoleSchema, environmentSchema, capabilitySchema
  - Shared DTOs: usageDtoSchema, costDtoSchema, messageDtoSchema, paginationInputSchema, paginationOutputSchema, promptVariableSchema
- Created 16 DTO files in `src/application/dto/llm/`:
  - `send-completion.dto.ts` - SendCompletion input/output
  - `stream-completion.dto.ts` - StreamCompletion input/output (with ReadableStream)
  - `send-chat-message.dto.ts` - SendChatMessage input/output
  - `get-conversation.dto.ts` - GetConversation input/output
  - `list-conversations.dto.ts` - ListConversations input/output with pagination
  - `list-messages.dto.ts` - ListMessages input/output with pagination
  - `delete-conversation.dto.ts` - DeleteConversation input/output
  - `estimate-cost.dto.ts` - EstimateCost input/output
  - `select-optimal-model.dto.ts` - SelectOptimalModel input/output
  - `create-managed-prompt.dto.ts` - CreateManagedPrompt input/output
  - `update-managed-prompt.dto.ts` - UpdateManagedPrompt input/output
  - `get-managed-prompt.dto.ts` - GetManagedPrompt input/output
  - `list-managed-prompts.dto.ts` - ListManagedPrompts input/output with pagination
  - `test-managed-prompt.dto.ts` - TestManagedPrompt input/output
  - `get-usage-stats.dto.ts` - GetUsageStats input/output with breakdown
  - `check-budget.dto.ts` - CheckBudget input/output

**Commands Run:**
- `pnpm type-check` - PASSED (after fixing z.record() signature)

**Verification:**
- All 16 DTOs created with Zod schemas
- Type check passes
- Ready for use case implementation

### 2026-01-15 - Task 21: [TDD] Write SendCompletionUseCase tests FIRST

**Completed:** ✅

**TDD Workflow:** RED phase (tests written, implementation pending)

**Changes:**
- Created `src/__TESTS__/application/llm/send-completion-use-case.test.ts` (~25 tests)
  - Happy path tests (5 tests): model selection, LLM call, usage recording, event dispatch
  - Budget checks tests (3 tests): budget validation, threshold warnings
  - Model selection error tests (2 tests): no capable model, capabilities mismatch
  - Provider error tests (2 tests): LLM call failures, timeout handling
  - Validation error tests (2 tests): empty prompt, invalid options
  - Variable substitution tests (1 test): {{variable}} replacement
  - Cost calculation tests (1 test): token-based cost computation
  - Repository error tests (2 tests): usage save failures

**Mocks Created:**
- mockLLMProvider (ILLMProvider)
- mockModelRouter (IModelRouter)
- mockUsageRepository (ILLMUsageRepository)
- mockEventDispatcher (IEventDispatcher)

**Commands Run:**
- `pnpm test` - 1 FAILED as expected (RED phase)
  - Error: "Cannot find package '@/application/use-cases/llm/send-completion.use-case'"

**Verification:**
- Tests written first following TDD workflow
- Tests fail because SendCompletionUseCase doesn't exist yet
- Ready for GREEN phase (Task 22)

### 2026-01-15 - Task 22: [IMPL] Implement SendCompletionUseCase (GREEN)

**Completed:** ✅

**TDD Workflow:** GREEN phase (all tests pass)

**Changes:**
- Created `src/application/use-cases/llm/send-completion.use-case.ts`
  - Constructor with 4 dependencies: llmProvider, modelRouter, usageRepository, eventDispatcher
  - execute() method implementing full completion flow:
    1. validateInput() - checks prompt is non-empty
    2. selectModel() - uses modelRouter with capabilities/budget/providers
    3. getModelConfig() - retrieves pricing config for cost calculation
    4. checkBudget() - validates user hasn't exceeded daily budget (if userId provided)
    5. substituteVariables() - replaces {{variables}} in prompt
    6. buildMessages() - creates system + user message array
    7. llmProvider.generateText() - calls LLM
    8. calculateCost() - computes cost from tokens and model config
    9. recordUsage() - creates LLMUsage aggregate and persists
    10. toDto() - maps response to output DTO

**Implementation Details:**
- DEFAULT_MAX_BUDGET = 100 (daily budget in USD)
- Uses match() from ddd-kit for Option handling
- Creates LLMUsage aggregate with all value objects (ProviderIdentifier, ModelIdentifier, TokenCount, Cost)
- Dispatches domain events after successful save
- Proper error handling at each step with Result pattern

**Commands Run:**
- `pnpm test` - 647 tests PASSED (all 18 SendCompletionUseCase tests pass)
- `pnpm type-check` - PASSED

**Verification:**
- All 18 SendCompletionUseCase tests pass
- No regressions on existing tests
- Type check passes
- Ready for Task 23 (StreamCompletionUseCase TDD RED)

