# PRD: Module LLM Plug & Play

## Overview

**Feature:** Module LLM multi-provider avec gestion intelligente des coûts
**Business Value:** Permettre d'intégrer n'importe quelle feature IA sans friction, avec abstraction multi-provider et contrôle des coûts
**Target Audience:** Développeurs de l'application + Utilisateurs finaux (chat) + Admins (gestion prompts)
**Platform:** Web (Next.js)

**Success Metrics:**
- Temps d'intégration d'une nouvelle feature IA < 30 min
- Réduction des coûts LLM de 30% via smart routing
- 100% des requêtes trackées avec coûts
- Zéro dépassement de budget non autorisé

---

## Domain Model

### Conversation Aggregate
Located at: `src/domain/llm/conversation/`

**Properties:**
- id: ConversationId (UUID)
- userId: UserId
- title: Option&lt;ConversationTitle&gt;
- messages: Message[] (Entity)
- metadata: Option&lt;ConversationMetadata&gt;
- createdAt: Date
- updatedAt: Option&lt;Date&gt;

**Value Objects:**
- ConversationTitle - string, 1-200 chars
- ConversationMetadata - JSON object for custom data

**Domain Events:**
- ConversationCreated - when new conversation starts
- ConversationTitleUpdated - when title is set/changed
- ConversationDeleted - when conversation is removed

---

### Message Entity
Located at: `src/domain/llm/conversation/entities/`

**Properties:**
- id: MessageId (UUID)
- role: MessageRole (user | assistant | system)
- content: MessageContent
- model: Option&lt;ModelIdentifier&gt;
- tokenUsage: Option&lt;TokenUsage&gt;
- cost: Option&lt;Cost&gt;
- createdAt: Date

**Value Objects:**
- MessageRole - enum: 'user' | 'assistant' | 'system'
- MessageContent - string, non-empty
- TokenUsage - { inputTokens: number, outputTokens: number, totalTokens: number }
- Cost - { amount: number, currency: 'USD' }

**Domain Events:**
- MessageAdded - when message added to conversation
- CompletionReceived - when LLM responds with cost tracking

---

### ManagedPrompt Aggregate
Located at: `src/domain/llm/prompt/`

**Properties:**
- id: ManagedPromptId (UUID)
- key: PromptKey (unique identifier)
- name: PromptName
- description: Option&lt;PromptDescription&gt;
- template: PromptTemplate
- variables: PromptVariable[]
- version: PromptVersion
- environment: PromptEnvironment
- isActive: boolean
- createdAt: Date
- updatedAt: Option&lt;Date&gt;

**Value Objects:**
- PromptKey - slug format, unique, 1-100 chars (e.g., "welcome-email", "product-description")
- PromptName - display name, 1-200 chars
- PromptDescription - optional description, max 1000 chars
- PromptTemplate - string with {{variable}} placeholders
- PromptVariable - { name: string, type: 'string' | 'number' | 'boolean', required: boolean, defaultValue?: string }
- PromptVersion - semantic version (1, 2, 3...)
- PromptEnvironment - enum: 'development' | 'staging' | 'production'

**Domain Events:**
- ManagedPromptCreated - when new prompt created
- ManagedPromptUpdated - when prompt content changes (new version)
- ManagedPromptActivated - when prompt is activated
- ManagedPromptDeactivated - when prompt is deactivated

---

### LLMUsage Aggregate (Cost Tracking)
Located at: `src/domain/llm/usage/`

**Properties:**
- id: LLMUsageId (UUID)
- userId: Option&lt;UserId&gt;
- conversationId: Option&lt;ConversationId&gt;
- provider: ProviderIdentifier
- model: ModelIdentifier
- inputTokens: TokenCount
- outputTokens: TokenCount
- cost: Cost
- requestDuration: Duration
- promptKey: Option&lt;PromptKey&gt;
- createdAt: Date

**Value Objects:**
- ProviderIdentifier - enum: 'openai' | 'anthropic' | 'google'
- ModelIdentifier - string (e.g., 'gpt-4o', 'claude-sonnet-4-20250514')
- TokenCount - positive integer
- Cost - { amount: number, currency: 'USD' }
- Duration - milliseconds

**Domain Events:**
- UsageRecorded - when any LLM call completes
- BudgetThresholdReached - when user/global budget hits 80%
- BudgetExceeded - when budget limit reached

---

### Domain Prompts (Value Objects - Code Only)
Located at: `src/domain/llm/prompts/`

**Not stored in DB** - defined as Value Objects in code, versioned via Git.

```typescript
// Domain prompt as VO
export class DomainPrompt extends ValueObject<IDomainPromptProps> {
  static readonly PRODUCT_DESCRIPTION = DomainPrompt.create({
    key: 'product-description',
    template: 'Generate a product description for {{productName}}...',
    variables: ['productName', 'features', 'targetAudience'],
  });

  static readonly JSON_EXTRACTOR = DomainPrompt.create({
    key: 'json-extractor',
    template: 'Extract structured data from: {{text}}. Return JSON...',
    variables: ['text', 'schema'],
  });
}
```

---

## Use Cases

### SendCompletionUseCase
Located at: `src/application/use-cases/llm/send-completion.use-case.ts`

**Input DTO:**
```typescript
interface ISendCompletionInputDto {
  prompt: string;
  systemPrompt?: string;
  variables?: Record<string, string>;
  options?: {
    maxBudget?: number;
    providers?: ('openai' | 'anthropic' | 'google')[];
    capabilities?: ('text' | 'json' | 'vision')[];
    temperature?: number;
    maxTokens?: number;
  };
  userId?: string;
  conversationId?: string;
}
```

**Output DTO:**
```typescript
interface ISendCompletionOutputDto {
  content: string;
  model: string;
  provider: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  cost: {
    amount: number;
    currency: string;
  };
}
```

**Business Rules:**
1. Select optimal model based on capabilities and cost (cheapest-capable)
2. Check budget before sending request
3. Record usage after successful completion
4. Emit BudgetExceeded event if budget is hit

**Acceptance Criteria:**
- [ ] Selects cheapest model that has required capabilities
- [ ] Rejects request if user budget exceeded
- [ ] Records cost in llm_usage table
- [ ] Returns structured response with cost breakdown
- [ ] Fallback to next provider on rate limit

**Events Emitted:**
- UsageRecorded on success
- BudgetExceeded if limit reached

**Error Cases:**
- BUDGET_EXCEEDED: "User daily budget exceeded"
- NO_CAPABLE_MODEL: "No model available with required capabilities"
- PROVIDER_ERROR: "LLM provider error: {details}"
- INVALID_PROMPT: "Prompt cannot be empty"

---

### StreamCompletionUseCase
Located at: `src/application/use-cases/llm/stream-completion.use-case.ts`

**Input DTO:**
```typescript
interface IStreamCompletionInputDto {
  prompt: string;
  systemPrompt?: string;
  variables?: Record<string, string>;
  options?: {
    maxBudget?: number;
    providers?: ('openai' | 'anthropic' | 'google')[];
    temperature?: number;
    maxTokens?: number;
  };
  userId?: string;
  conversationId?: string;
}
```

**Output DTO:**
```typescript
interface IStreamCompletionOutputDto {
  stream: ReadableStream<string>;
  model: string;
  provider: string;
}
// Cost tracked via onFinish callback
```

**Business Rules:**
1. Same routing logic as SendCompletion
2. Return stream immediately
3. Track cost on stream completion (onFinish)
4. Support cancellation

**Acceptance Criteria:**
- [ ] Returns ReadableStream for UI consumption
- [ ] Tracks tokens and cost after stream ends
- [ ] Handles stream cancellation gracefully
- [ ] Compatible with AI SDK useChat hook

---

### SendChatMessageUseCase
Located at: `src/application/use-cases/llm/send-chat-message.use-case.ts`

**Input DTO:**
```typescript
interface ISendChatMessageInputDto {
  conversationId?: string; // Create new if not provided
  message: string;
  systemPrompt?: string;
  userId: string;
  options?: {
    maxBudget?: number;
    providers?: ('openai' | 'anthropic' | 'google')[];
    stream?: boolean;
  };
}
```

**Output DTO:**
```typescript
interface ISendChatMessageOutputDto {
  conversationId: string;
  message: {
    id: string;
    role: 'assistant';
    content: string;
  };
  usage: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}
// Or stream variant
```

**Business Rules:**
1. Create conversation if not exists
2. Add user message to conversation
3. Send to LLM with conversation history
4. Add assistant response to conversation
5. Track usage

**Acceptance Criteria:**
- [ ] Creates conversation on first message
- [ ] Persists all messages
- [ ] Includes conversation history in context
- [ ] Supports streaming response
- [ ] Updates conversation title from first exchange

---

### GetConversationUseCase
Located at: `src/application/use-cases/llm/get-conversation.use-case.ts`

**Input DTO:**
```typescript
interface IGetConversationInputDto {
  conversationId: string;
  userId: string;
}
```

**Output DTO:**
```typescript
interface IGetConversationOutputDto {
  id: string;
  title: string | null;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string | null;
}
```

**Acceptance Criteria:**
- [ ] Returns conversation with all messages
- [ ] Verifies user owns conversation
- [ ] Returns 404 if not found

---

### ListConversationsUseCase
Located at: `src/application/use-cases/llm/list-conversations.use-case.ts`

**Input DTO:**
```typescript
interface IListConversationsInputDto {
  userId: string;
  pagination?: { page: number; limit: number };
}
```

**Output DTO:**
```typescript
interface IListConversationsOutputDto {
  conversations: Array<{
    id: string;
    title: string | null;
    lastMessage: string | null;
    messageCount: number;
    createdAt: string;
    updatedAt: string | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

### DeleteConversationUseCase
Located at: `src/application/use-cases/llm/delete-conversation.use-case.ts`

**Acceptance Criteria:**
- [ ] Soft delete or hard delete conversation
- [ ] Verify ownership
- [ ] Emit ConversationDeleted event

---

### CreateManagedPromptUseCase
Located at: `src/application/use-cases/llm/managed-prompts/create-managed-prompt.use-case.ts`

**Input DTO:**
```typescript
interface ICreateManagedPromptInputDto {
  key: string;
  name: string;
  description?: string;
  template: string;
  variables?: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    defaultValue?: string;
  }>;
  environment: 'development' | 'staging' | 'production';
}
```

**Output DTO:**
```typescript
interface ICreateManagedPromptOutputDto {
  id: string;
  key: string;
  name: string;
  version: number;
  createdAt: string;
}
```

**Business Rules:**
1. Key must be unique per environment
2. Extract variables from template ({{varName}})
3. Initial version = 1
4. isActive = true by default

**Acceptance Criteria:**
- [ ] Creates prompt with version 1
- [ ] Validates template syntax
- [ ] Extracts variables from {{}} placeholders
- [ ] Prevents duplicate keys in same environment

---

### UpdateManagedPromptUseCase
Located at: `src/application/use-cases/llm/managed-prompts/update-managed-prompt.use-case.ts`

**Business Rules:**
1. Creates new version (increments version number)
2. Keeps previous versions for rollback
3. Only active version is used

**Acceptance Criteria:**
- [ ] Increments version on update
- [ ] Preserves version history
- [ ] Only one active version per key/environment

---

### GetManagedPromptUseCase
Located at: `src/application/use-cases/llm/managed-prompts/get-managed-prompt.use-case.ts`

**Input:** key + environment
**Output:** Active prompt with rendered template capability

---

### ListManagedPromptsUseCase
Located at: `src/application/use-cases/llm/managed-prompts/list-managed-prompts.use-case.ts`

**Features:**
- Filter by environment
- Search by name/key
- Pagination

---

### RollbackManagedPromptUseCase
Located at: `src/application/use-cases/llm/managed-prompts/rollback-managed-prompt.use-case.ts`

**Acceptance Criteria:**
- [ ] Activates previous version
- [ ] Deactivates current version
- [ ] Emits appropriate events

---

### TestManagedPromptUseCase (Playground)
Located at: `src/application/use-cases/llm/managed-prompts/test-managed-prompt.use-case.ts`

**Input DTO:**
```typescript
interface ITestManagedPromptInputDto {
  promptId: string;
  variables: Record<string, string>;
  provider?: string;
  model?: string;
}
```

**Acceptance Criteria:**
- [ ] Renders template with provided variables
- [ ] Sends to LLM
- [ ] Returns response without persisting usage (or marks as test)

---

### SelectOptimalModelUseCase
Located at: `src/application/use-cases/llm/select-optimal-model.use-case.ts`

**Input DTO:**
```typescript
interface ISelectOptimalModelInputDto {
  capabilities: ('text' | 'json' | 'vision')[];
  maxBudget?: number;
  preferredProviders?: string[];
  strategy?: 'cheapest' | 'fastest' | 'round-robin';
}
```

**Output DTO:**
```typescript
interface ISelectOptimalModelOutputDto {
  provider: string;
  model: string;
  estimatedCostPer1kTokens: {
    input: number;
    output: number;
  };
}
```

**Business Rules:**
1. Filter models by capabilities
2. Sort by cost (cheapest-capable strategy)
3. Check provider availability
4. Return optimal choice

---

### EstimateCostUseCase
Located at: `src/application/use-cases/llm/estimate-cost.use-case.ts`

**Input DTO:**
```typescript
interface IEstimateCostInputDto {
  text: string;
  model?: string;
}
```

**Output DTO:**
```typescript
interface IEstimateCostOutputDto {
  estimatedTokens: number;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
}
```

---

### GetUsageStatsUseCase
Located at: `src/application/use-cases/llm/get-usage-stats.use-case.ts`

**Input DTO:**
```typescript
interface IGetUsageStatsInputDto {
  userId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'provider' | 'model';
}
```

**Output DTO:**
```typescript
interface IGetUsageStatsOutputDto {
  totalCost: number;
  totalTokens: number;
  requestCount: number;
  breakdown: Array<{
    period?: string;
    provider?: string;
    model?: string;
    cost: number;
    tokens: number;
    requests: number;
  }>;
  budgetStatus: {
    dailyUsed: number;
    dailyLimit: number;
    monthlyUsed: number;
    monthlyLimit: number;
  };
}
```

---

### CheckBudgetUseCase
Located at: `src/application/use-cases/llm/check-budget.use-case.ts`

**Business Rules:**
1. Check user daily budget
2. Check global daily/monthly budget
3. Return remaining budget

---

## Ports (Interfaces)

### ILLMProvider
Located at: `src/application/ports/llm.provider.port.ts`

```typescript
interface ILLMProvider {
  generateText(params: GenerateTextParams): Promise<Result<GenerateTextResponse>>;
  streamText(params: StreamTextParams): Promise<Result<StreamTextResponse>>;
  estimateTokens(text: string): Promise<Result<number>>;
  getAvailableModels(): ModelConfig[];
}

interface GenerateTextParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateTextResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

interface StreamTextResponse {
  stream: ReadableStream<string>;
  usage: Promise<{ inputTokens: number; outputTokens: number }>;
}
```

---

### IConversationRepository
Located at: `src/application/ports/conversation.repository.port.ts`

```typescript
interface IConversationRepository extends BaseRepository<Conversation> {
  findByUserId(userId: string, pagination?: PaginationParams): Promise<Result<PaginatedResult<Conversation>>>;
  addMessage(conversationId: string, message: Message): Promise<Result<Message>>;
  getWithMessages(conversationId: string): Promise<Result<Option<Conversation>>>;
}
```

---

### IManagedPromptRepository
Located at: `src/application/ports/managed-prompt.repository.port.ts`

```typescript
interface IManagedPromptRepository extends BaseRepository<ManagedPrompt> {
  findByKey(key: string, environment: string): Promise<Result<Option<ManagedPrompt>>>;
  findActiveByKey(key: string, environment: string): Promise<Result<Option<ManagedPrompt>>>;
  getVersionHistory(promptId: string): Promise<Result<ManagedPrompt[]>>;
  activateVersion(promptId: string, version: number): Promise<Result<void>>;
}
```

---

### ILLMUsageRepository
Located at: `src/application/ports/llm-usage.repository.port.ts`

```typescript
interface ILLMUsageRepository extends BaseRepository<LLMUsage> {
  getTotalCostByUser(userId: string, period: 'day' | 'month'): Promise<Result<number>>;
  getTotalCostGlobal(period: 'day' | 'month'): Promise<Result<number>>;
  getUsageStats(params: UsageStatsParams): Promise<Result<UsageStats>>;
}
```

---

### IModelRouter
Located at: `src/application/ports/model-router.port.ts`

```typescript
interface IModelRouter {
  selectOptimalModel(params: SelectModelParams): Result<SelectedModel>;
  getModelConfig(provider: string, model: string): Option<ModelConfig>;
  getAllModels(): ModelConfig[];
}

interface SelectModelParams {
  capabilities: string[];
  maxBudget?: number;
  preferredProviders?: string[];
  strategy: 'cheapest' | 'fastest' | 'round-robin';
}

interface ModelConfig {
  provider: string;
  model: string;
  costPer1kIn: number;
  costPer1kOut: number;
  capabilities: string[];
  maxTokens: number;
  enabled: boolean;
}
```

---

## API Endpoints / Server Actions

### Chat Actions
Located at: `src/adapters/actions/llm.actions.ts`

```typescript
// Send message (non-streaming)
sendChatMessageAction(input: ISendChatMessageInputDto): Promise<ActionResult<ISendChatMessageOutputDto>>

// Get conversation
getConversationAction(conversationId: string): Promise<ActionResult<IGetConversationOutputDto>>

// List conversations
listConversationsAction(pagination?: PaginationParams): Promise<ActionResult<IListConversationsOutputDto>>

// Delete conversation
deleteConversationAction(conversationId: string): Promise<ActionResult<void>>
```

### Streaming API Route
Located at: `app/api/llm/chat/route.ts`

```typescript
// POST /api/llm/chat
// For streaming responses with AI SDK
export async function POST(request: Request) {
  // Handles streaming with proper headers
  // Returns ReadableStream
}
```

### Managed Prompts Actions (Admin)
Located at: `src/adapters/actions/managed-prompts.actions.ts`

```typescript
createManagedPromptAction(input): Promise<ActionResult<...>>
updateManagedPromptAction(input): Promise<ActionResult<...>>
getManagedPromptAction(key, env): Promise<ActionResult<...>>
listManagedPromptsAction(filters): Promise<ActionResult<...>>
deleteManagedPromptAction(id): Promise<ActionResult<...>>
rollbackManagedPromptAction(id, version): Promise<ActionResult<...>>
testManagedPromptAction(input): Promise<ActionResult<...>>
```

### Usage Stats Actions (Admin)
Located at: `src/adapters/actions/llm-usage.actions.ts`

```typescript
getUsageStatsAction(params): Promise<ActionResult<IGetUsageStatsOutputDto>>
getBudgetStatusAction(userId?): Promise<ActionResult<BudgetStatus>>
```

---

## Event Handlers (Policies)

### On UsageRecorded
**Handler:** `CheckBudgetThresholdHandler`
**Action:** If usage > 80% of budget, emit BudgetThresholdReached

### On BudgetThresholdReached
**Handler:** `NotifyBudgetThresholdHandler`
**Action:** Send notification to admin/user about approaching limit

### On BudgetExceeded
**Handler:** `HandleBudgetExceededHandler`
**Action:** Log, notify admin, potentially disable further requests

### On ConversationCreated
**Handler:** `SetDefaultTitleHandler`
**Action:** Could auto-generate title from first message (optional)

---

## Database Schema

Located at: `packages/drizzle/src/schema/llm.ts`

```typescript
import { boolean, integer, jsonb, pgTable, text, timestamp, decimal, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enums
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system']);
export const providerEnum = pgEnum('llm_provider', ['openai', 'anthropic', 'google']);
export const environmentEnum = pgEnum('prompt_environment', ['development', 'staging', 'production']);

// Conversations
export const conversation = pgTable("llm_conversation", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Messages
export const message = pgTable("llm_message", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull().references(() => conversation.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  model: text("model"),
  provider: providerEnum("provider"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  cost: decimal("cost", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Managed Prompts
export const managedPrompt = pgTable("llm_managed_prompt", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  template: text("template").notNull(),
  variables: jsonb("variables").$type<Array<{
    name: string;
    type: 'string' | 'number' | 'boolean';
    required: boolean;
    defaultValue?: string;
  }>>(),
  version: integer("version").notNull().default(1),
  environment: environmentEnum("environment").notNull().default('development'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Unique constraint: key + environment + version
// Index on: key + environment + isActive

// LLM Usage (Cost Tracking)
export const llmUsage = pgTable("llm_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  conversationId: text("conversation_id").references(() => conversation.id, { onDelete: "set null" }),
  provider: providerEnum("provider").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull(),
  requestDurationMs: integer("request_duration_ms"),
  promptKey: text("prompt_key"),
  isTest: boolean("is_test").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Indexes for llm_usage:
// - userId + createdAt (for user budget queries)
// - createdAt (for global budget queries)
// - provider + model (for analytics)
```

---

## UI Components

### Chat Components

#### ChatInterface
- **Location:** `app/(protected)/chat/_components/chat-interface.tsx`
- **Purpose:** Main chat UI with message list and input
- **Features:**
  - Uses AI SDK `useChat` hook
  - Streaming support with status states
  - Stop button during streaming
  - Error handling with retry

#### MessageList
- **Location:** `app/(protected)/chat/_components/message-list.tsx`
- **Purpose:** Displays conversation messages
- **Props:** messages, isLoading

#### MessageBubble
- **Location:** `app/(protected)/chat/_components/message-bubble.tsx`
- **Purpose:** Individual message display
- **Props:** message, role, isStreaming

#### ChatInput
- **Location:** `app/(protected)/chat/_components/chat-input.tsx`
- **Purpose:** Text input with send button
- **Features:** Disabled during streaming, keyboard shortcuts

#### ConversationList
- **Location:** `app/(protected)/chat/_components/conversation-list.tsx`
- **Purpose:** Sidebar with conversation history
- **Features:** New chat button, delete, search

### Admin Dashboard Components

#### ManagedPromptsTable
- **Location:** `app/(protected)/admin/prompts/_components/prompts-table.tsx`
- **Purpose:** List all managed prompts with actions

#### PromptEditor
- **Location:** `app/(protected)/admin/prompts/_components/prompt-editor.tsx`
- **Purpose:** Create/edit prompt with template preview
- **Features:**
  - Syntax highlighting for {{variables}}
  - Variable extraction preview
  - Environment selector

#### PromptPlayground
- **Location:** `app/(protected)/admin/prompts/_components/prompt-playground.tsx`
- **Purpose:** Test prompts with variables
- **Features:**
  - Variable inputs
  - Provider/model selector
  - Execute and see response
  - Cost preview

#### VersionHistory
- **Location:** `app/(protected)/admin/prompts/_components/version-history.tsx`
- **Purpose:** Show prompt versions with rollback option

#### UsageDashboard
- **Location:** `app/(protected)/admin/usage/_components/usage-dashboard.tsx`
- **Purpose:** Display cost and usage statistics
- **Features:**
  - Charts (daily/monthly usage)
  - By provider/model breakdown
  - Budget status indicators

---

## Configuration

Located at: `apps/nextjs/common/llm/config.ts`

```typescript
export interface LLMConfig {
  providers: {
    openai: ProviderConfig;
    anthropic: ProviderConfig;
    google: ProviderConfig;
  };
  routing: {
    strategy: 'cheapest' | 'fastest' | 'round-robin';
    fallbackEnabled: boolean;
    maxRetries: number;
  };
  budgets: {
    global: { daily: number; monthly: number };
    perUser: { daily: number };
  };
}

interface ProviderConfig {
  enabled: boolean;
  apiKey: string;
  models: Record<string, ModelConfig>;
}

interface ModelConfig {
  costPer1kIn: number;
  costPer1kOut: number;
  capabilities: ('text' | 'json' | 'vision')[];
  maxTokens: number;
}

// Default config
export const llmConfig: LLMConfig = {
  providers: {
    openai: {
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY ?? '',
      models: {
        'gpt-4o': { costPer1kIn: 0.005, costPer1kOut: 0.015, capabilities: ['text', 'json', 'vision'], maxTokens: 128000 },
        'gpt-4o-mini': { costPer1kIn: 0.00015, costPer1kOut: 0.0006, capabilities: ['text', 'json'], maxTokens: 128000 },
      },
    },
    anthropic: {
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY ?? '',
      models: {
        'claude-sonnet-4-20250514': { costPer1kIn: 0.003, costPer1kOut: 0.015, capabilities: ['text', 'json', 'vision'], maxTokens: 200000 },
      },
    },
    google: {
      enabled: false,
      apiKey: process.env.GOOGLE_API_KEY ?? '',
      models: {},
    },
  },
  routing: {
    strategy: 'cheapest',
    fallbackEnabled: true,
    maxRetries: 2,
  },
  budgets: {
    global: { daily: 100, monthly: 2000 },
    perUser: { daily: 5 },
  },
};
```

---

## Implementation Checklist

### Domain Layer
- [ ] Create `ConversationId` in `src/domain/llm/conversation/conversation-id.ts`
- [ ] Create `Conversation` aggregate in `src/domain/llm/conversation/conversation.aggregate.ts`
- [ ] Create `Message` entity in `src/domain/llm/conversation/entities/message.entity.ts`
- [ ] Create `MessageId` in `src/domain/llm/conversation/entities/message-id.ts`
- [ ] Create conversation VOs: `ConversationTitle`, `MessageContent`, `MessageRole`
- [ ] Create conversation events: `ConversationCreated`, `MessageAdded`, `ConversationDeleted`
- [ ] Create `ManagedPromptId` in `src/domain/llm/prompt/managed-prompt-id.ts`
- [ ] Create `ManagedPrompt` aggregate in `src/domain/llm/prompt/managed-prompt.aggregate.ts`
- [ ] Create prompt VOs: `PromptKey`, `PromptTemplate`, `PromptVariable`, `PromptEnvironment`
- [ ] Create prompt events: `ManagedPromptCreated`, `ManagedPromptUpdated`
- [ ] Create `LLMUsageId` in `src/domain/llm/usage/llm-usage-id.ts`
- [ ] Create `LLMUsage` aggregate in `src/domain/llm/usage/llm-usage.aggregate.ts`
- [ ] Create usage VOs: `TokenCount`, `Cost`, `ProviderIdentifier`, `ModelIdentifier`
- [ ] Create usage events: `UsageRecorded`, `BudgetThresholdReached`, `BudgetExceeded`
- [ ] Create Domain Prompts (code-only VOs) in `src/domain/llm/prompts/domain-prompts.ts`

### Application Layer
- [ ] Create conversation DTOs in `src/application/dto/llm/conversation/`
- [ ] Create prompt DTOs in `src/application/dto/llm/prompt/`
- [ ] Create usage DTOs in `src/application/dto/llm/usage/`
- [ ] Create `ILLMProvider` port in `src/application/ports/llm.provider.port.ts`
- [ ] Create `IConversationRepository` port
- [ ] Create `IManagedPromptRepository` port
- [ ] Create `ILLMUsageRepository` port
- [ ] Create `IModelRouter` port
- [ ] Create `SendCompletionUseCase`
- [ ] Create `StreamCompletionUseCase`
- [ ] Create `SendChatMessageUseCase`
- [ ] Create `GetConversationUseCase`
- [ ] Create `ListConversationsUseCase`
- [ ] Create `DeleteConversationUseCase`
- [ ] Create `CreateManagedPromptUseCase`
- [ ] Create `UpdateManagedPromptUseCase`
- [ ] Create `GetManagedPromptUseCase`
- [ ] Create `ListManagedPromptsUseCase`
- [ ] Create `RollbackManagedPromptUseCase`
- [ ] Create `TestManagedPromptUseCase`
- [ ] Create `SelectOptimalModelUseCase`
- [ ] Create `EstimateCostUseCase`
- [ ] Create `GetUsageStatsUseCase`
- [ ] Create `CheckBudgetUseCase`

### Adapters Layer
- [ ] Create `ConversationMapper` in `src/adapters/mappers/conversation.mapper.ts`
- [ ] Create `ManagedPromptMapper` in `src/adapters/mappers/managed-prompt.mapper.ts`
- [ ] Create `LLMUsageMapper` in `src/adapters/mappers/llm-usage.mapper.ts`
- [ ] Create `DrizzleConversationRepository` in `src/adapters/repositories/conversation.repository.ts`
- [ ] Create `DrizzleManagedPromptRepository` in `src/adapters/repositories/managed-prompt.repository.ts`
- [ ] Create `DrizzleLLMUsageRepository` in `src/adapters/repositories/llm-usage.repository.ts`
- [ ] Create `AISDKLLMProvider` in `src/adapters/llm/ai-sdk-llm.provider.ts`
- [ ] Create `ModelRouter` in `src/adapters/llm/model-router.ts`
- [ ] Create LLM server actions in `src/adapters/actions/llm.actions.ts`
- [ ] Create managed prompts actions in `src/adapters/actions/managed-prompts.actions.ts`
- [ ] Create usage actions in `src/adapters/actions/llm-usage.actions.ts`
- [ ] Create event handlers in `src/adapters/events/handlers/`

### Infrastructure
- [ ] Add LLM schema in `packages/drizzle/src/schema/llm.ts`
- [ ] Export from `packages/drizzle/src/schema/index.ts`
- [ ] Create `llm.module.ts` in `common/di/modules/`
- [ ] Add DI symbols in `common/di/types.ts`
- [ ] Load module in `common/di/container.ts`
- [ ] Add LLM config in `common/llm/config.ts`
- [ ] Create streaming API route `app/api/llm/chat/route.ts`

### UI
- [ ] Create chat page at `app/(protected)/chat/page.tsx`
- [ ] Create chat layout at `app/(protected)/chat/layout.tsx`
- [ ] Create `ChatInterface` component
- [ ] Create `MessageList` component
- [ ] Create `MessageBubble` component
- [ ] Create `ChatInput` component
- [ ] Create `ConversationList` component
- [ ] Create admin prompts page at `app/(protected)/admin/prompts/page.tsx`
- [ ] Create `ManagedPromptsTable` component
- [ ] Create `PromptEditor` component
- [ ] Create `PromptPlayground` component
- [ ] Create `VersionHistory` component
- [ ] Create admin usage page at `app/(protected)/admin/usage/page.tsx`
- [ ] Create `UsageDashboard` component
- [ ] Add navigation links to sidebar

### Tests
- [ ] Domain tests: Conversation aggregate
- [ ] Domain tests: ManagedPrompt aggregate
- [ ] Domain tests: LLMUsage aggregate
- [ ] Domain tests: All Value Objects
- [ ] Use case tests: SendCompletionUseCase
- [ ] Use case tests: SendChatMessageUseCase
- [ ] Use case tests: CreateManagedPromptUseCase
- [ ] Use case tests: CheckBudgetUseCase
- [ ] Integration tests: Streaming
- [ ] E2E tests: Chat flow
- [ ] E2E tests: Admin prompt management

---

## DX Example Usage

```typescript
// Dans un Use Case métier - One-shot avec Domain Prompt
export class GenerateProductDescriptionUseCase {
  constructor(
    private readonly llmService: ILLMProvider,
    private readonly modelRouter: IModelRouter,
    private readonly usageRepo: ILLMUsageRepository,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // 1. Get domain prompt (code-only, not from DB)
    const prompt = DomainPrompts.PRODUCT_DESCRIPTION;

    // 2. Render with variables
    const renderedPrompt = prompt.render({
      productName: input.productName,
      features: input.features.join(', '),
    });

    // 3. Select optimal model
    const modelResult = this.modelRouter.selectOptimalModel({
      capabilities: ['text'],
      strategy: 'cheapest',
    });
    if (modelResult.isFailure) return Result.fail(modelResult.getError());

    // 4. Send completion
    const completionResult = await this.llmService.generateText({
      model: modelResult.getValue().model,
      messages: [{ role: 'user', content: renderedPrompt }],
    });
    if (completionResult.isFailure) return Result.fail(completionResult.getError());

    // 5. Track usage
    const response = completionResult.getValue();
    await this.usageRepo.create(LLMUsage.create({
      provider: modelResult.getValue().provider,
      model: response.model,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      cost: this.calculateCost(response.usage, modelResult.getValue()),
    }));

    return Result.ok({
      description: response.content,
      cost: response.cost,
    });
  }
}
```

```typescript
// Avec Managed Prompt (from DB)
export class SendMarketingEmailUseCase {
  constructor(
    private readonly promptRepo: IManagedPromptRepository,
    private readonly llmService: ILLMProvider,
  ) {}

  async execute(input: Input): Promise<Result<Output>> {
    // 1. Get managed prompt from DB
    const promptResult = await this.promptRepo.findActiveByKey(
      'marketing-email-generator',
      'production'
    );
    if (promptResult.isFailure) return Result.fail(promptResult.getError());

    return match(promptResult.getValue(), {
      Some: async (prompt) => {
        // 2. Render template
        const rendered = prompt.render({
          userName: input.userName,
          productName: input.productName,
        });

        // 3. Generate
        const result = await this.llmService.generateText({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: rendered }],
        });

        return result;
      },
      None: () => Result.fail('Prompt not found'),
    });
  }
}
```

---

## Next Steps

After PRD approval:
1. `/create-plan` - Generate implementation plan for Ralph Loop
2. `/gen-domain Conversation` - Generate conversation domain
3. `/gen-domain ManagedPrompt` - Generate prompt domain
4. `/gen-usecase SendCompletion` - Generate first use case
5. `pnpm db:push` - Push schema changes
