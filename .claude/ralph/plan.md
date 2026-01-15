# Implementation Plan: Module LLM Plug & Play (TDD/BDD)

## Overview
Module LLM multi-provider avec gestion intelligente des couts, conversations, streaming, domain prompts, managed prompts, et dashboard admin.

**Approach:** Test-Driven Development (TDD) / Behavior-Driven Development (BDD)
- Écrire les tests AVANT l'implémentation
- Tests définissent le comportement attendu
- Implémenter jusqu'à ce que les tests passent

**Reference:** `.claude/ralph/PRD.md`
**Estimated Tasks:** 65

---

## Task List

```json
[
  {
    "category": "setup",
    "description": "Create LLM module directory structure",
    "steps": [
      "Create src/domain/llm/conversation/",
      "Create src/domain/llm/conversation/entities/",
      "Create src/domain/llm/conversation/events/",
      "Create src/domain/llm/conversation/value-objects/",
      "Create src/domain/llm/conversation/__tests__/",
      "Create src/domain/llm/prompt/",
      "Create src/domain/llm/prompt/events/",
      "Create src/domain/llm/prompt/value-objects/",
      "Create src/domain/llm/prompt/__tests__/",
      "Create src/domain/llm/usage/",
      "Create src/domain/llm/usage/events/",
      "Create src/domain/llm/usage/value-objects/",
      "Create src/domain/llm/usage/__tests__/",
      "Create src/domain/llm/prompts/ (domain prompts)",
      "Create src/application/use-cases/llm/",
      "Create src/application/use-cases/llm/__tests__/",
      "Create src/application/use-cases/llm/managed-prompts/",
      "Create src/application/dto/llm/",
      "Create src/adapters/llm/",
      "Create src/adapters/llm/__tests__/",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "infrastructure",
    "description": "Add LLM database schema",
    "steps": [
      "Create packages/drizzle/src/schema/llm.ts",
      "Define messageRoleEnum, providerEnum, environmentEnum",
      "Create conversation table",
      "Create message table with foreign key to conversation",
      "Create managedPrompt table",
      "Create llmUsage table",
      "Add indexes for userId+createdAt, provider+model",
      "Export from packages/drizzle/src/schema/index.ts",
      "Run pnpm db:push"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Implement Conversation aggregate ID",
    "steps": [
      "Create ConversationId in src/domain/llm/conversation/conversation-id.ts",
      "Extend UUID from ddd-kit",
      "Add static create() method",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Implement Conversation value objects",
    "steps": [
      "Create ConversationTitle VO (1-200 chars)",
      "Create ConversationMetadata VO (JSON object)",
      "Add Zod validation to each VO",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Implement Message entity",
    "steps": [
      "Create MessageId in entities/message-id.ts",
      "Create MessageRole VO (enum: user, assistant, system)",
      "Create MessageContent VO (non-empty string)",
      "Create TokenUsage VO (inputTokens, outputTokens, totalTokens)",
      "Create Cost VO (amount, currency)",
      "Create Message entity with all properties",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "domain",
    "description": "Implement Conversation aggregate and events",
    "steps": [
      "Create Conversation aggregate in conversation.aggregate.ts",
      "Add properties: id, userId, title, metadata, timestamps",
      "Add static create() method",
      "Add static reconstitute() method",
      "Add updateTitle() and updateMetadata() methods",
      "Create ConversationCreatedEvent",
      "Create MessageAddedEvent",
      "Create ConversationDeletedEvent",
      "Create CompletionReceivedEvent",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write Conversation VO tests FIRST",
    "steps": [
      "Create __tests__/conversation-title.vo.test.ts",
      "Test valid title (1-200 chars)",
      "Test empty title fails",
      "Test title too long fails",
      "Test title trimming",
      "Create __tests__/conversation-metadata.vo.test.ts",
      "Test valid JSON object",
      "Test null metadata allowed",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write Message entity tests FIRST",
    "steps": [
      "Create __tests__/message.entity.test.ts",
      "Test Message.create() creates entity with correct props",
      "Test Message.reconstitute() restores entity",
      "Test MessageRole VO (user, assistant, system)",
      "Test invalid role fails",
      "Test MessageContent VO (non-empty)",
      "Test empty content fails",
      "Test TokenUsage VO (positive integers)",
      "Test negative token values fail",
      "Test Cost VO (positive amount, valid currency)",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write Conversation aggregate tests FIRST",
    "steps": [
      "Create __tests__/conversation.aggregate.test.ts",
      "Test Conversation.create() creates aggregate",
      "Test Conversation.create() emits ConversationCreatedEvent",
      "Test Conversation.create() with existing ID does NOT emit event",
      "Test reconstitute() restores aggregate without events",
      "Test updateTitle() updates title and updatedAt",
      "Test updateMetadata() updates metadata and updatedAt",
      "Test markUpdated() sets updatedAt",
      "Test getters return correct values",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write Domain Events tests FIRST",
    "steps": [
      "Create __tests__/conversation-created.event.test.ts",
      "Test event has correct eventType",
      "Test event has correct aggregateId",
      "Test event payload contains all required fields",
      "Create __tests__/message-added.event.test.ts",
      "Test event payload includes message details",
      "Create __tests__/completion-received.event.test.ts",
      "Test event includes token and cost info",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-impl",
    "description": "[IMPL] Make Conversation domain tests pass (GREEN)",
    "steps": [
      "Fix ConversationTitle VO to pass tests",
      "Fix ConversationMetadata VO to pass tests",
      "Fix MessageRole, MessageContent, TokenUsage, Cost VOs",
      "Fix Message entity to pass tests",
      "Fix Conversation aggregate to pass tests",
      "Fix domain events to pass tests",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write ManagedPrompt VO tests FIRST",
    "steps": [
      "Create __tests__/prompt-key.vo.test.ts",
      "Test valid slug format (lowercase, hyphens)",
      "Test invalid chars fail",
      "Test max length 100",
      "Create __tests__/prompt-name.vo.test.ts",
      "Test valid name 1-200 chars",
      "Create __tests__/prompt-description.vo.test.ts",
      "Test max 1000 chars",
      "Create __tests__/prompt-template.vo.test.ts",
      "Test valid template with {{variables}}",
      "Test extractVariables() returns correct list",
      "Create __tests__/prompt-variable.vo.test.ts",
      "Test name, type, required, defaultValue",
      "Create __tests__/prompt-environment.vo.test.ts",
      "Test enum values (development, staging, production)",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write ManagedPrompt aggregate tests FIRST",
    "steps": [
      "Create __tests__/managed-prompt.aggregate.test.ts",
      "Test ManagedPrompt.create() creates with version 1",
      "Test create() emits ManagedPromptCreatedEvent",
      "Test updateContent() increments version",
      "Test updateContent() emits ManagedPromptUpdatedEvent",
      "Test activate() sets isActive true and emits event",
      "Test deactivate() sets isActive false and emits event",
      "Test render() substitutes variables correctly",
      "Test render() with missing variable returns error",
      "Test reconstitute() restores without events",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-impl",
    "description": "[IMPL] Implement ManagedPrompt VOs and aggregate (GREEN)",
    "steps": [
      "Create ManagedPromptId in managed-prompt-id.ts",
      "Create PromptKey VO (slug format)",
      "Create PromptName VO (1-200 chars)",
      "Create PromptDescription VO (max 1000 chars)",
      "Create PromptTemplate VO with extractVariables()",
      "Create PromptVariable VO",
      "Create PromptEnvironment VO (enum)",
      "Create ManagedPrompt aggregate with all methods",
      "Create ManagedPromptCreatedEvent",
      "Create ManagedPromptUpdatedEvent",
      "Create ManagedPromptActivatedEvent",
      "Create ManagedPromptDeactivatedEvent",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write LLMUsage tests FIRST",
    "steps": [
      "Create __tests__/llm-usage.aggregate.test.ts",
      "Test LLMUsage.create() creates with all props",
      "Test create() emits UsageRecordedEvent",
      "Create __tests__/provider-identifier.vo.test.ts",
      "Test valid providers (openai, anthropic, google)",
      "Test invalid provider fails",
      "Create __tests__/model-identifier.vo.test.ts",
      "Test valid model strings",
      "Create __tests__/token-count.vo.test.ts",
      "Test positive integers only",
      "Create __tests__/duration.vo.test.ts",
      "Test positive milliseconds",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-impl",
    "description": "[IMPL] Implement LLMUsage domain (GREEN)",
    "steps": [
      "Create LLMUsageId",
      "Create ProviderIdentifier VO",
      "Create ModelIdentifier VO",
      "Create TokenCount VO",
      "Create Duration VO",
      "Create LLMUsage aggregate",
      "Create UsageRecordedEvent",
      "Create BudgetThresholdReachedEvent",
      "Create BudgetExceededEvent",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": true
  },
  {
    "category": "domain-tdd",
    "description": "[TDD] Write DomainPrompt tests FIRST",
    "steps": [
      "Create __tests__/domain-prompt.test.ts",
      "Test DomainPrompt.render() with single variable",
      "Test DomainPrompt.render() with multiple variables",
      "Test render() with missing variable fails",
      "Test static prompt definitions exist",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "domain-impl",
    "description": "[IMPL] Implement DomainPrompt (GREEN)",
    "steps": [
      "Create DomainPrompt class in prompts/domain-prompt.ts",
      "Add static prompt definitions",
      "Implement render() method",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create LLM port interfaces",
    "steps": [
      "Create ILLMProvider port",
      "Create IConversationRepository port",
      "Create IMessageRepository port (for pagination)",
      "Create IManagedPromptRepository port",
      "Create ILLMUsageRepository port",
      "Create IModelRouter port",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "application",
    "description": "Create all DTOs",
    "steps": [
      "Create send-chat-message.dto.ts",
      "Create get-conversation.dto.ts",
      "Create list-conversations.dto.ts",
      "Create list-messages.dto.ts (paginated)",
      "Create delete-conversation.dto.ts",
      "Create send-completion.dto.ts",
      "Create stream-completion.dto.ts",
      "Create estimate-cost.dto.ts",
      "Create select-optimal-model.dto.ts",
      "Create create-managed-prompt.dto.ts",
      "Create update-managed-prompt.dto.ts",
      "Create get-managed-prompt.dto.ts",
      "Create list-managed-prompts.dto.ts",
      "Create test-managed-prompt.dto.ts",
      "Create get-usage-stats.dto.ts",
      "Create check-budget.dto.ts",
      "Verify with pnpm type-check"
    ],
    "passes": true
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write SendCompletionUseCase tests FIRST",
    "steps": [
      "Create __tests__/send-completion.use-case.test.ts",
      "Mock ILLMProvider, IModelRouter, ILLMUsageRepository, IEventDispatcher",
      "Test happy path: model selected, completion returned",
      "Test budget exceeded returns error Result",
      "Test no capable model returns error Result",
      "Test provider error returns error Result",
      "Test usage recorded after completion",
      "Test UsageRecordedEvent dispatched",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement SendCompletionUseCase (GREEN)",
    "steps": [
      "Create send-completion.use-case.ts",
      "Inject dependencies",
      "Implement model selection",
      "Implement budget check",
      "Record usage",
      "Dispatch events",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": true
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write StreamCompletionUseCase tests FIRST",
    "steps": [
      "Create __tests__/stream-completion.use-case.test.ts",
      "Test returns ReadableStream",
      "Test cost tracked on stream finish",
      "Test cancellation handled gracefully",
      "Test error propagated correctly",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": true
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement StreamCompletionUseCase (GREEN)",
    "steps": [
      "Create stream-completion.use-case.ts",
      "Return ReadableStream",
      "Track cost on onFinish",
      "Handle cancellation",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write SendChatMessageUseCase tests FIRST",
    "steps": [
      "Create __tests__/send-chat-message.use-case.test.ts",
      "Test creates conversation if not exists",
      "Test uses existing conversation if provided",
      "Test creates user message",
      "Test includes history in LLM context",
      "Test creates assistant response message",
      "Test saves conversation and messages",
      "Test events dispatched after save",
      "Test ownership verified",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement SendChatMessageUseCase (GREEN)",
    "steps": [
      "Create send-chat-message.use-case.ts",
      "Implement conversation creation/retrieval",
      "Implement message handling",
      "Implement history inclusion",
      "Implement event dispatch",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write conversation management use case tests FIRST",
    "steps": [
      "Create __tests__/get-conversation.use-case.test.ts",
      "Test returns conversation when found",
      "Test returns error when not found",
      "Test ownership verified",
      "Create __tests__/list-conversations.use-case.test.ts",
      "Test returns paginated list",
      "Test filters by userId",
      "Create __tests__/list-messages.use-case.test.ts",
      "Test returns paginated messages for conversation",
      "Test ownership verified",
      "Create __tests__/delete-conversation.use-case.test.ts",
      "Test deletes conversation",
      "Test ownership verified",
      "Test emits ConversationDeletedEvent",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement conversation management use cases (GREEN)",
    "steps": [
      "Create GetConversationUseCase",
      "Create ListConversationsUseCase",
      "Create ListMessagesUseCase (paginated)",
      "Create DeleteConversationUseCase",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write CreateManagedPromptUseCase tests FIRST",
    "steps": [
      "Create __tests__/create-managed-prompt.use-case.test.ts",
      "Test creates prompt with version 1",
      "Test extracts variables from template",
      "Test duplicate key returns error",
      "Test environment validation",
      "Test emits ManagedPromptCreatedEvent",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement CreateManagedPromptUseCase (GREEN)",
    "steps": [
      "Create create-managed-prompt.use-case.ts",
      "Implement key uniqueness check",
      "Implement variable extraction",
      "Dispatch events",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write UpdateManagedPromptUseCase tests FIRST",
    "steps": [
      "Create __tests__/update-managed-prompt.use-case.test.ts",
      "Test version increments",
      "Test previous version preserved",
      "Test emits ManagedPromptUpdatedEvent",
      "Test not found returns error",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement UpdateManagedPromptUseCase (GREEN)",
    "steps": [
      "Create update-managed-prompt.use-case.ts",
      "Implement version increment",
      "Dispatch events",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write other managed prompt use case tests FIRST",
    "steps": [
      "Create __tests__/get-managed-prompt.use-case.test.ts",
      "Create __tests__/list-managed-prompts.use-case.test.ts",
      "Create __tests__/rollback-managed-prompt.use-case.test.ts",
      "Create __tests__/test-managed-prompt.use-case.test.ts",
      "Test all happy paths and error cases",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement other managed prompt use cases (GREEN)",
    "steps": [
      "Create GetManagedPromptUseCase",
      "Create ListManagedPromptsUseCase",
      "Create RollbackManagedPromptUseCase",
      "Create TestManagedPromptUseCase",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "application-tdd",
    "description": "[TDD] Write routing and cost use case tests FIRST",
    "steps": [
      "Create __tests__/select-optimal-model.use-case.test.ts",
      "Test selects cheapest capable model",
      "Test respects budget constraints",
      "Test no capable model returns error",
      "Create __tests__/estimate-cost.use-case.test.ts",
      "Test estimates cost correctly",
      "Create __tests__/get-usage-stats.use-case.test.ts",
      "Test aggregates usage data",
      "Create __tests__/check-budget.use-case.test.ts",
      "Test returns budget status",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "application-impl",
    "description": "[IMPL] Implement routing and cost use cases (GREEN)",
    "steps": [
      "Create SelectOptimalModelUseCase",
      "Create EstimateCostUseCase",
      "Create GetUsageStatsUseCase",
      "Create CheckBudgetUseCase",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "adapters-tdd",
    "description": "[TDD] Write mapper tests FIRST",
    "steps": [
      "Create __tests__/conversation.mapper.test.ts",
      "Test domain to DB mapping",
      "Test DB to domain mapping",
      "Test Option handling",
      "Create __tests__/message.mapper.test.ts",
      "Create __tests__/managed-prompt.mapper.test.ts",
      "Create __tests__/llm-usage.mapper.test.ts",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "adapters-impl",
    "description": "[IMPL] Implement mappers (GREEN)",
    "steps": [
      "Create ConversationMapper",
      "Create MessageMapper",
      "Create ManagedPromptMapper",
      "Create LLMUsageMapper",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "adapters-tdd",
    "description": "[TDD] Write repository tests FIRST",
    "steps": [
      "Create __tests__/conversation.repository.test.ts",
      "Test create, findById, findAll, update, delete",
      "Test pagination",
      "Create __tests__/message.repository.test.ts",
      "Test findByConversationId with pagination",
      "Create __tests__/managed-prompt.repository.test.ts",
      "Test findByKey, versioning",
      "Create __tests__/llm-usage.repository.test.ts",
      "Test aggregation queries",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "adapters-impl",
    "description": "[IMPL] Implement repositories (GREEN)",
    "steps": [
      "Create DrizzleConversationRepository",
      "Create DrizzleMessageRepository",
      "Create DrizzleManagedPromptRepository",
      "Create DrizzleLLMUsageRepository",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "adapters-tdd",
    "description": "[TDD] Write LLM provider tests FIRST",
    "steps": [
      "Create __tests__/ai-sdk-llm.provider.test.ts",
      "Mock AI SDK",
      "Test generateText returns Result<T>",
      "Test streamText returns ReadableStream",
      "Test estimateTokens",
      "Test error handling",
      "Test fallback on rate limit",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "adapters-impl",
    "description": "[IMPL] Implement AI SDK LLM provider (GREEN)",
    "steps": [
      "Create AISDKLLMProvider",
      "Implement generateText()",
      "Implement streamText()",
      "Implement estimateTokens()",
      "Implement error handling",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "adapters-tdd",
    "description": "[TDD] Write Model Router tests FIRST",
    "steps": [
      "Create __tests__/model-router.test.ts",
      "Test selectOptimalModel with cheapest-capable strategy",
      "Test filters by capabilities",
      "Test respects budget",
      "Test returns error when no model available",
      "Run pnpm test - tests should FAIL (RED)"
    ],
    "passes": false
  },
  {
    "category": "adapters-impl",
    "description": "[IMPL] Implement Model Router (GREEN)",
    "steps": [
      "Create ModelRouter",
      "Implement selectOptimalModel()",
      "Load model configs",
      "Run pnpm test - ALL TESTS MUST PASS (GREEN)"
    ],
    "passes": false
  },
  {
    "category": "infrastructure",
    "description": "Create LLM DI module and config",
    "steps": [
      "Create common/llm/config.ts",
      "Add model pricing and capabilities",
      "Add budget configuration",
      "Create common/di/modules/llm.module.ts",
      "Add all DI symbols to types.ts",
      "Register module in container.ts",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Create server actions and API routes",
    "steps": [
      "Create src/adapters/actions/llm.actions.ts",
      "Create src/adapters/actions/managed-prompts.actions.ts",
      "Create src/adapters/actions/llm-usage.actions.ts",
      "Create app/api/llm/chat/route.ts for streaming",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create chat page and layout",
    "steps": [
      "Create app/(protected)/chat/page.tsx",
      "Create app/(protected)/chat/layout.tsx with sidebar",
      "Add requireAuth guard",
      "Verify page loads"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create ChatInterface component",
    "steps": [
      "Create _components/chat-interface.tsx",
      "Use AI SDK useChat hook",
      "Handle streaming states",
      "Add stop button during streaming",
      "Add retry on error",
      "Verify streaming works"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create chat sub-components",
    "steps": [
      "Create MessageList component",
      "Create MessageBubble component",
      "Create ChatInput component",
      "Create ConversationList sidebar",
      "Verify all components render"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create admin prompts page",
    "steps": [
      "Create app/(protected)/admin/prompts/page.tsx",
      "Create ManagedPromptsTable component",
      "Create PromptEditor component",
      "Create VersionHistory component",
      "Verify CRUD operations work"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create prompt playground",
    "steps": [
      "Create PromptPlayground component",
      "Add variable inputs form",
      "Add provider/model selector",
      "Add execute button with response display",
      "Add cost preview",
      "Verify playground works"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create admin usage dashboard",
    "steps": [
      "Create app/(protected)/admin/usage/page.tsx",
      "Create UsageDashboard component",
      "Add charts for usage",
      "Add breakdown by provider/model",
      "Add budget status indicators",
      "Verify dashboard displays data"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Add navigation links",
    "steps": [
      "Add Chat link to main navigation",
      "Add Admin section with Prompts and Usage links",
      "Add role-based visibility for admin links",
      "Verify navigation works"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Achieve 90% test coverage",
    "steps": [
      "Run pnpm test:coverage",
      "Identify uncovered lines in domain layer",
      "Add missing tests",
      "Identify uncovered lines in application layer",
      "Add missing tests",
      "Verify coverage >= 90% for LLM module"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Final validation - all checks must pass",
    "steps": [
      "Run pnpm check:all - MUST PASS",
      "Run pnpm check:duplication - MUST PASS",
      "Run pnpm check:unused - MUST PASS",
      "Run pnpm test:coverage - MUST BE >= 90%",
      "Test chat feature manually in browser",
      "Test admin prompts CRUD in browser",
      "Test usage dashboard in browser",
      "Verify streaming works smoothly",
      "All acceptance criteria met"
    ],
    "passes": false
  }
]
```

---

## TDD Workflow

For each feature:
1. **RED**: Write failing tests that define expected behavior
2. **GREEN**: Implement minimal code to make tests pass
3. **REFACTOR**: Clean up code while keeping tests green

### Categories Explained

- `domain-tdd`: Write domain tests FIRST (RED phase)
- `domain-impl`: Implement to make tests pass (GREEN phase)
- `application-tdd`: Write use case tests FIRST (RED phase)
- `application-impl`: Implement to make tests pass (GREEN phase)
- `adapters-tdd`: Write adapter tests FIRST (RED phase)
- `adapters-impl`: Implement to make tests pass (GREEN phase)

---

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find the next task with `"passes": false`
3. For TDD tasks: Write tests that FAIL initially
4. For IMPL tasks: Implement until tests PASS
5. Update the task to `"passes": true`
6. Log completion in `activity.md`
7. Make one git commit for that task only
8. Repeat until all tasks pass

**Important:**
- Only modify the `passes` field. Do not remove or rewrite tasks.
- Work on exactly ONE task at a time
- Commit after each completed task
- Do not run git push

---

## Completion Criteria

All tasks marked with `"passes": true`

### Acceptance Criteria (MANDATORY)

- [ ] All tests written and passing
- [ ] `pnpm check:all` passes without errors
- [ ] Test coverage >= 90% for LLM module
- [ ] `pnpm check:duplication` passes
- [ ] `pnpm check:unused` passes
- [ ] All features work in browser (chat, admin prompts, usage dashboard)
