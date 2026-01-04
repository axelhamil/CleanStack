import { Github } from "lucide-react-native";
import { Linking, Text, View } from "react-native";
import { BrutalistButton } from "./ui/brutalist-button";
import { StatCard } from "./ui/stat-card";

const stats = [
  { label: "TypeScript", value: "100%" },
  { label: "AI-Ready", value: "Yes" },
  { label: "Production", value: "Ready" },
];

export function CTASection() {
  const openDocs = () => {
    Linking.openURL(
      "https://github.com/axelhamil/nextjs-clean-architecture-starter#readme",
    );
  };

  const openGitHub = () => {
    Linking.openURL(
      "https://github.com/axelhamil/nextjs-clean-architecture-starter",
    );
  };

  return (
    <View className="py-12 px-4 bg-white border-t-2 border-gray-200">
      <Text className="text-2xl font-black uppercase text-center mb-3 text-black">
        Ready to Build?
      </Text>

      <Text className="text-base text-center text-gray-600 mb-6 max-w-xs mx-auto">
        Start your next project with production-ready architecture.
      </Text>

      <View className="gap-3 mb-8 items-center">
        <BrutalistButton size="lg" onPress={openDocs}>
          Get Started →
        </BrutalistButton>
        <BrutalistButton size="lg" variant="outline" onPress={openGitHub}>
          <View className="flex-row items-center gap-2">
            <Github size={16} color="#000" />
            <Text className="font-bold uppercase text-sm text-black">
              Star on GitHub
            </Text>
          </View>
        </BrutalistButton>
      </View>

      <View className="flex-row gap-3 justify-center">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            className="flex-1 max-w-24"
          />
        ))}
      </View>
    </View>
  );
}
