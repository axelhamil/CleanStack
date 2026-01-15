# Implementation Plan: Module LLM Plug & Play

## Overview
Module LLM multi-provider avec gestion intelligente des couts, conversations, streaming, domain prompts, managed prompts, et dashboard admin.

**Reference:** `.claude/ralph/PRD.md`
**Estimated Tasks:** 57

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
      "Create src/domain/llm/prompt/",
      "Create src/domain/llm/prompt/events/",
      "Create src/domain/llm/prompt/value-objects/",
      "Create src/domain/llm/usage/",
      "Create src/domain/llm/usage/events/",
      "Create src/domain/llm/usage/value-objects/",
      "Create src/domain/llm/prompts/ (domain prompts)",
      "Create src/application/use-cases/llm/",
      "Create src/application/use-cases/llm/managed-prompts/",
      "Create src/application/dto/llm/",
      "Create src/adapters/llm/",
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
    "passes": false
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
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement Conversation aggregate",
    "steps": [
      "Create Conversation aggregate in conversation.aggregate.ts",
      "Add properties: id, userId, title, messages, metadata, timestamps",
      "Add static create() method",
      "Add static reconstitute() method",
      "Add addMessage() method",
      "Add updateTitle() method",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement Conversation domain events",
    "steps": [
      "Create ConversationCreatedEvent",
      "Create MessageAddedEvent",
      "Create ConversationDeletedEvent",
      "Create CompletionReceivedEvent",
      "Add event emission in aggregate methods",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement ManagedPrompt aggregate ID and VOs",
    "steps": [
      "Create ManagedPromptId in src/domain/llm/prompt/managed-prompt-id.ts",
      "Create PromptKey VO (slug format, 1-100 chars)",
      "Create PromptName VO (1-200 chars)",
      "Create PromptDescription VO (max 1000 chars)",
      "Create PromptTemplate VO (string with {{variable}} support)",
      "Create PromptVariable VO (name, type, required, defaultValue)",
      "Create PromptEnvironment VO (enum: development, staging, production)",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement ManagedPrompt aggregate",
    "steps": [
      "Create ManagedPrompt aggregate in managed-prompt.aggregate.ts",
      "Add all properties from PRD",
      "Add static create() method",
      "Add static reconstitute() method",
      "Add updateContent() method (increments version)",
      "Add activate() / deactivate() methods",
      "Add render() method for template variable substitution",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement ManagedPrompt domain events",
    "steps": [
      "Create ManagedPromptCreatedEvent",
      "Create ManagedPromptUpdatedEvent",
      "Create ManagedPromptActivatedEvent",
      "Create ManagedPromptDeactivatedEvent",
      "Add event emission in aggregate methods",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement LLMUsage aggregate",
    "steps": [
      "Create LLMUsageId in src/domain/llm/usage/llm-usage-id.ts",
      "Create ProviderIdentifier VO (enum: openai, anthropic, google)",
      "Create ModelIdentifier VO (string)",
      "Create TokenCount VO (positive integer)",
      "Create Duration VO (milliseconds)",
      "Create LLMUsage aggregate with all properties",
      "Add static create() method",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement LLMUsage domain events",
    "steps": [
      "Create UsageRecordedEvent",
      "Create BudgetThresholdReachedEvent",
      "Create BudgetExceededEvent",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "domain",
    "description": "Implement Domain Prompts (code-only)",
    "steps": [
      "Create DomainPrompt class in src/domain/llm/prompts/domain-prompt.ts",
      "Add static prompt definitions (PRODUCT_DESCRIPTION, JSON_EXTRACTOR)",
      "Add render() method for variable substitution",
      "Create example domain prompts for common use cases",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Create LLM port interfaces",
    "steps": [
      "Create ILLMProvider port in src/application/ports/llm.provider.port.ts",
      "Create IConversationRepository port",
      "Create IManagedPromptRepository port",
      "Create ILLMUsageRepository port",
      "Create IModelRouter port",
      "Define all method signatures from PRD",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Create conversation DTOs",
    "steps": [
      "Create send-chat-message.dto.ts with input/output schemas",
      "Create get-conversation.dto.ts",
      "Create list-conversations.dto.ts",
      "Create delete-conversation.dto.ts",
      "Add Zod validation to all DTOs",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Create completion DTOs",
    "steps": [
      "Create send-completion.dto.ts with input/output schemas",
      "Create stream-completion.dto.ts",
      "Create estimate-cost.dto.ts",
      "Create select-optimal-model.dto.ts",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Create managed prompt DTOs",
    "steps": [
      "Create create-managed-prompt.dto.ts",
      "Create update-managed-prompt.dto.ts",
      "Create get-managed-prompt.dto.ts",
      "Create list-managed-prompts.dto.ts",
      "Create test-managed-prompt.dto.ts",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Create usage DTOs",
    "steps": [
      "Create get-usage-stats.dto.ts",
      "Create check-budget.dto.ts",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement SendCompletionUseCase",
    "steps": [
      "Create send-completion.use-case.ts",
      "Inject ILLMProvider, IModelRouter, ILLMUsageRepository",
      "Implement model selection (cheapest-capable)",
      "Implement budget check before request",
      "Record usage after completion",
      "Emit UsageRecorded event",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement StreamCompletionUseCase",
    "steps": [
      "Create stream-completion.use-case.ts",
      "Return ReadableStream for UI",
      "Track cost on stream completion (onFinish)",
      "Handle cancellation gracefully",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement SendChatMessageUseCase",
    "steps": [
      "Create send-chat-message.use-case.ts",
      "Create conversation if not exists",
      "Add user message to conversation",
      "Include conversation history in LLM context",
      "Add assistant response",
      "Track usage",
      "Dispatch events after save",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement conversation management use cases",
    "steps": [
      "Create GetConversationUseCase",
      "Create ListConversationsUseCase with pagination",
      "Create DeleteConversationUseCase",
      "Verify ownership in all use cases",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement managed prompt use cases",
    "steps": [
      "Create CreateManagedPromptUseCase",
      "Create UpdateManagedPromptUseCase (versioning)",
      "Create GetManagedPromptUseCase",
      "Create ListManagedPromptsUseCase",
      "Create RollbackManagedPromptUseCase",
      "Create TestManagedPromptUseCase (playground)",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "application",
    "description": "Implement routing and cost use cases",
    "steps": [
      "Create SelectOptimalModelUseCase",
      "Create EstimateCostUseCase",
      "Create GetUsageStatsUseCase",
      "Create CheckBudgetUseCase",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement mappers",
    "steps": [
      "Create ConversationMapper (domain <-> db)",
      "Create MessageMapper",
      "Create ManagedPromptMapper",
      "Create LLMUsageMapper",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement repositories",
    "steps": [
      "Create DrizzleConversationRepository",
      "Create DrizzleManagedPromptRepository",
      "Create DrizzleLLMUsageRepository",
      "Implement all interface methods",
      "Add pagination support",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement AI SDK LLM provider",
    "steps": [
      "Create AISDKLLMProvider in src/adapters/llm/ai-sdk-llm.provider.ts",
      "Implement generateText() with Result<T>",
      "Implement streamText() returning ReadableStream",
      "Implement estimateTokens()",
      "Handle provider errors gracefully",
      "Add fallback logic on rate limits",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "adapters",
    "description": "Implement Model Router",
    "steps": [
      "Create ModelRouter in src/adapters/llm/model-router.ts",
      "Implement selectOptimalModel() with cheapest-capable strategy",
      "Load model configs from llm config",
      "Filter by capabilities and budget",
      "Verify with pnpm type-check"
    ],
    "passes": false
  },
  {
    "category": "infrastructure",
    "description": "Create LLM DI module and config",
    "steps": [
      "Create common/llm/config.ts with provider configs",
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
    "category": "testing",
    "description": "Write Conversation domain tests",
    "steps": [
      "Create __tests__/conversation.aggregate.test.ts",
      "Test Conversation.create() emits ConversationCreatedEvent",
      "Test addMessage() adds message and emits MessageAddedEvent",
      "Test updateTitle() updates title correctly",
      "Test reconstitute() restores aggregate without events",
      "Test all edge cases and validation errors",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write Message entity tests",
    "steps": [
      "Create __tests__/message.entity.test.ts",
      "Test Message.create() with all properties",
      "Test MessageRole VO validation",
      "Test MessageContent VO (non-empty)",
      "Test TokenUsage VO (positive integers)",
      "Test Cost VO validation",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write Conversation value objects tests",
    "steps": [
      "Create __tests__/conversation-title.vo.test.ts",
      "Create __tests__/conversation-metadata.vo.test.ts",
      "Test valid and invalid inputs",
      "Test edge cases (min/max length, special chars)",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write ManagedPrompt domain tests",
    "steps": [
      "Create __tests__/managed-prompt.aggregate.test.ts",
      "Test ManagedPrompt.create() emits ManagedPromptCreatedEvent",
      "Test updateContent() increments version and emits event",
      "Test activate()/deactivate() methods",
      "Test render() with variable substitution",
      "Test reconstitute() restores aggregate",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write ManagedPrompt value objects tests",
    "steps": [
      "Create __tests__/prompt-key.vo.test.ts (slug validation)",
      "Create __tests__/prompt-template.vo.test.ts",
      "Create __tests__/prompt-variable.vo.test.ts",
      "Create __tests__/prompt-environment.vo.test.ts",
      "Test all edge cases and invalid inputs",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write LLMUsage domain tests",
    "steps": [
      "Create __tests__/llm-usage.aggregate.test.ts",
      "Test LLMUsage.create() with all properties",
      "Test UsageRecordedEvent emission",
      "Create __tests__/provider-identifier.vo.test.ts",
      "Create __tests__/model-identifier.vo.test.ts",
      "Create __tests__/token-count.vo.test.ts",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write DomainPrompt tests",
    "steps": [
      "Create __tests__/domain-prompt.test.ts",
      "Test DomainPrompt.render() with variables",
      "Test missing variable handling",
      "Test static prompt definitions",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write SendCompletionUseCase tests",
    "steps": [
      "Create __tests__/send-completion.use-case.test.ts",
      "Mock ILLMProvider, IModelRouter, ILLMUsageRepository",
      "Test happy path with model selection",
      "Test budget exceeded error",
      "Test no capable model error",
      "Test provider error handling",
      "Test usage recording after completion",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write StreamCompletionUseCase tests",
    "steps": [
      "Create __tests__/stream-completion.use-case.test.ts",
      "Test stream returns ReadableStream",
      "Test cost tracking on stream finish",
      "Test cancellation handling",
      "Test error propagation",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write SendChatMessageUseCase tests",
    "steps": [
      "Create __tests__/send-chat-message.use-case.test.ts",
      "Test creates conversation if not exists",
      "Test adds user message to conversation",
      "Test includes history in LLM context",
      "Test adds assistant response",
      "Test event dispatch after save",
      "Test ownership verification",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write conversation management use case tests",
    "steps": [
      "Create __tests__/get-conversation.use-case.test.ts",
      "Create __tests__/list-conversations.use-case.test.ts",
      "Create __tests__/delete-conversation.use-case.test.ts",
      "Test pagination in list",
      "Test ownership verification in all",
      "Test not found error handling",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write CreateManagedPromptUseCase tests",
    "steps": [
      "Create __tests__/create-managed-prompt.use-case.test.ts",
      "Test successful prompt creation",
      "Test duplicate key error",
      "Test variable extraction from template",
      "Test version starts at 1",
      "Test environment validation",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write UpdateManagedPromptUseCase tests",
    "steps": [
      "Create __tests__/update-managed-prompt.use-case.test.ts",
      "Test version increment on update",
      "Test previous version preserved",
      "Test event emission",
      "Test not found error",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write other managed prompt use case tests",
    "steps": [
      "Create __tests__/get-managed-prompt.use-case.test.ts",
      "Create __tests__/list-managed-prompts.use-case.test.ts",
      "Create __tests__/rollback-managed-prompt.use-case.test.ts",
      "Create __tests__/test-managed-prompt.use-case.test.ts",
      "Test all happy paths and error cases",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write routing and cost use case tests",
    "steps": [
      "Create __tests__/select-optimal-model.use-case.test.ts",
      "Create __tests__/estimate-cost.use-case.test.ts",
      "Create __tests__/get-usage-stats.use-case.test.ts",
      "Create __tests__/check-budget.use-case.test.ts",
      "Test cheapest-capable selection",
      "Test budget limit checks",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write repository tests",
    "steps": [
      "Create __tests__/conversation.repository.test.ts",
      "Create __tests__/managed-prompt.repository.test.ts",
      "Create __tests__/llm-usage.repository.test.ts",
      "Test CRUD operations",
      "Test pagination",
      "Test custom query methods",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write LLM provider and router tests",
    "steps": [
      "Create __tests__/ai-sdk-llm.provider.test.ts",
      "Create __tests__/model-router.test.ts",
      "Test generateText with mocked AI SDK",
      "Test streamText returns proper stream",
      "Test model selection strategies",
      "Test fallback on rate limit",
      "Run pnpm test and verify passes"
    ],
    "passes": false
  },
  {
    "category": "testing",
    "description": "Write mapper tests",
    "steps": [
      "Create __tests__/conversation.mapper.test.ts",
      "Create __tests__/managed-prompt.mapper.test.ts",
      "Create __tests__/llm-usage.mapper.test.ts",
      "Test domain to DB mapping",
      "Test DB to domain mapping",
      "Test edge cases (null fields, Option handling)",
      "Run pnpm test and verify passes"
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
      "Handle streaming states (loading, error, success)",
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
      "Create MessageBubble component with role-based styling",
      "Create ChatInput component with keyboard shortcuts",
      "Create ConversationList sidebar component",
      "Verify all components render correctly"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create admin prompts page",
    "steps": [
      "Create app/(protected)/admin/prompts/page.tsx",
      "Create ManagedPromptsTable component",
      "Create PromptEditor component with template preview",
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
      "Verify playground works end-to-end"
    ],
    "passes": false
  },
  {
    "category": "ui",
    "description": "Create admin usage dashboard",
    "steps": [
      "Create app/(protected)/admin/usage/page.tsx",
      "Create UsageDashboard component",
      "Add charts for daily/monthly usage",
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
    "category": "testing",
    "description": "Achieve 90% test coverage",
    "steps": [
      "Run pnpm test:coverage",
      "Identify uncovered lines in domain layer",
      "Add missing tests for uncovered code paths",
      "Identify uncovered lines in application layer",
      "Add missing tests for uncovered use cases",
      "Verify coverage >= 90% for src/domain/llm/**",
      "Verify coverage >= 90% for src/application/use-cases/llm/**",
      "Run pnpm test:coverage and confirm >= 90% overall"
    ],
    "passes": false
  },
  {
    "category": "verification",
    "description": "Final validation - all checks must pass",
    "steps": [
      "Run pnpm check:all - MUST PASS",
      "Fix any linting issues until clean",
      "Fix any type errors until clean",
      "Fix any test failures until all green",
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

## Agent Instructions

1. Read `activity.md` first to understand current state
2. Find the next task with `"passes": false`
3. Complete all steps for that task
4. Verify the change works (type-check, tests, browser)
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
