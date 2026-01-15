import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

export const providerEnum = pgEnum("provider", [
  "openai",
  "anthropic",
  "google",
]);

export const environmentEnum = pgEnum("environment", [
  "development",
  "staging",
  "production",
]);

export const conversation = pgTable(
  "conversation",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("conversation_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const message = pgTable(
  "message",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    role: messageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),
    costAmount: real("cost_amount"),
    costCurrency: text("cost_currency").default("USD"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("message_conversation_idx").on(table.conversationId)],
);

export const managedPrompt = pgTable(
  "managed_prompt",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    template: text("template").notNull(),
    variables: jsonb("variables").notNull().default([]),
    version: integer("version").notNull().default(1),
    environment: environmentEnum("environment")
      .notNull()
      .default("development"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("managed_prompt_key_env_idx").on(table.key, table.environment),
  ],
);

export const llmUsage = pgTable(
  "llm_usage",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    conversationId: text("conversation_id").references(() => conversation.id, {
      onDelete: "set null",
    }),
    provider: providerEnum("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    costAmount: real("cost_amount").notNull(),
    costCurrency: text("cost_currency").notNull().default("USD"),
    requestDuration: integer("request_duration"),
    promptKey: text("prompt_key"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("llm_usage_user_created_idx").on(table.userId, table.createdAt),
    index("llm_usage_provider_model_idx").on(table.provider, table.model),
  ],
);
