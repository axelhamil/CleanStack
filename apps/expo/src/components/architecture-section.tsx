import { ScrollView, Text, View } from "react-native";
import { Section } from "./ui/section";

const architectureDiagram = `┌─ CLEANSTACK ARCHITECTURE ─────────┐
│                                   │
│   HTTP Request                    │
│        ↓                          │
│   ┌───────────────────────────┐   │
│   │  [Adapters]               │   │
│   │  Controllers & Presenters │   │
│   └───────────────────────────┘   │
│        ↓                          │
│   ┌───────────────────────────┐   │
│   │  [Application]            │   │
│   │  Use Cases                │   │
│   └───────────────────────────┘   │
│        ↓                          │
│   ┌───────────────────────────┐   │
│   │  [Domain]                 │   │
│   │  Entities & Value Objects │   │
│   └───────────────────────────┘   │
│        ↓                          │
│   ┌───────────────────────────┐   │
│   │  [Infrastructure]         │   │
│   │  Database & External APIs │   │
│   └───────────────────────────┘   │
│                                   │
└───────────────────────────────────┘`;

const layers = [
  "Domain: Zero external dependencies, pure business logic",
  "Application: Use cases orchestrate domain operations",
  "Adapters: Transform data between layers",
  "Infrastructure: Database, APIs, external services",
];

export function ArchitectureSection() {
  return (
    <Section variant="inverted">
      <Text className="text-2xl font-black uppercase text-center mb-6 text-white">
        Architecture
      </Text>

      <View
        className="border-2 border-white bg-black p-4 mb-6"
        style={{
          shadowColor: "#fff",
          shadowOffset: { width: 8, height: 8 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text className="text-green-400 font-mono text-xs leading-5">
            {architectureDiagram}
          </Text>
        </ScrollView>
      </View>

      <Text className="text-white text-base font-medium mb-4">
        All dependencies point INWARD toward the Domain:
      </Text>

      <View className="gap-2">
        {layers.map((layer) => (
          <View key={layer} className="flex-row items-start">
            <Text className="text-white font-black mr-2">→</Text>
            <Text className="text-white text-sm flex-1">{layer}</Text>
          </View>
        ))}
      </View>
    </Section>
  );
}
