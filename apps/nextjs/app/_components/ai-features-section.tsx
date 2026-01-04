"use client";

import { CodeBlock } from "@packages/ui/components/code-block";
import { FeatureCard } from "@packages/ui/components/feature-card";
import { Section } from "@packages/ui/components/section";
import { SectionHeader } from "@packages/ui/components/section-header";
import { Bot, Brain, FileCode2, Sparkles, Zap } from "lucide-react";

const aiFeatures = [
  {
    icon: Bot,
    title: "Claude Code Ready",
    description:
      "Complete CLAUDE.md with architecture context. AI understands your codebase instantly.",
  },
  {
    icon: Brain,
    title: "Explicit Patterns",
    description:
      "Result<T>, Option<T>, and DDD patterns documented for AI comprehension.",
  },
  {
    icon: FileCode2,
    title: ".cursorrules Included",
    description:
      "Architectural rules defined. AI follows Clean Architecture automatically.",
  },
  {
    icon: Sparkles,
    title: "AI-Optimized DX",
    description:
      "Type-safe patterns and helper scripts. Build faster with AI assistance.",
  },
];

const codeExample = `# AI Development Guidelines

## Mandatory Rules

### Respect the Dependency Rule (CRITICAL)
- Domain MUST NOT import from Application
- All dependencies point INWARD

### Error Handling Pattern (MANDATORY)
**NEVER throw exceptions** in Domain/Application.
Use Result<T> pattern:

const result = Email.create(input.email)
if (result.isFailure) {
  return Result.fail(result.error)
}`;

export function AIFeaturesSection() {
  return (
    <Section>
      <SectionHeader
        badge={{ icon: Zap, text: "AI-First Development" }}
        title={
          <>
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Assistants
            </span>
          </>
        }
        subtitle="Every architectural decision is documented and optimized for AI comprehension."
      />

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-16">
        {aiFeatures.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            index={index}
            variant="compact"
          />
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <CodeBlock code={codeExample} title="CLAUDE.md" variant="terminal" />
      </div>
    </Section>
  );
}
