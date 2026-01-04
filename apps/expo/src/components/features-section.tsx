import { Layers, Lock, Package, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { FeatureCard } from "./ui/feature-card";
import { Section } from "./ui/section";

const features = [
  {
    icon: Layers,
    title: "Clean Architecture",
    description:
      "Separation of concerns with Domain, Application, and Adapters layers.",
  },
  {
    icon: Sparkles,
    title: "Domain-Driven Design",
    description: "Entities, Value Objects, Aggregates, and Domain Events.",
  },
  {
    icon: Lock,
    title: "Type Safety",
    description: "End-to-end TypeScript with Result<T> and Option<T>.",
  },
  {
    icon: Package,
    title: "Monorepo",
    description: "Turborepo + PNPM workspaces for shared code.",
  },
];

export function FeaturesSection() {
  return (
    <Section variant="muted">
      <Text className="text-2xl font-black uppercase text-center mb-8 text-black">
        Core Features
      </Text>

      <View className="gap-4">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </View>
    </Section>
  );
}
