import { Bot, Brain, FileCode2, Sparkles, Zap } from "lucide-react-native";
import { View } from "react-native";
import { CodeBlock } from "./ui/code-block";
import { FeatureCard } from "./ui/feature-card";
import { Section } from "./ui/section";
import { SectionHeader } from "./ui/section-header";

const aiFeatures = [
  {
    icon: Bot,
    title: "Claude Code Ready",
    description: "Complete CLAUDE.md with architecture context.",
  },
  {
    icon: Brain,
    title: "Explicit Patterns",
    description: "Result<T>, Option<T>, and DDD patterns documented.",
  },
  {
    icon: FileCode2,
    title: ".cursorrules",
    description: "AI follows Clean Architecture automatically.",
  },
  {
    icon: Sparkles,
    title: "AI-Optimized DX",
    description: "Type-safe patterns and helper scripts.",
  },
];

const codeExample = `# AI Development Guidelines

## Mandatory Rules

### Dependency Rule (CRITICAL)
- Domain MUST NOT import from Application
- All dependencies point INWARD

### Error Handling (MANDATORY)
Use Result<T> pattern:

const result = Email.create(input.email)
if (result.isFailure) {
  return Result.fail(result.error)
}`;

export function AIFeaturesSection() {
  return (
    <Section>
      <SectionHeader
        badge={{ icon: Zap, text: "AI-First" }}
        title="Built for AI Assistants"
        subtitle="Every architectural decision is documented for AI comprehension."
      />

      <View className="gap-3 mb-6">
        {aiFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            variant="compact"
          />
        ))}
      </View>

      <CodeBlock code={codeExample} title="CLAUDE.md" />
    </Section>
  );
}
