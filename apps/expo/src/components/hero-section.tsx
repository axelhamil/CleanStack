import { Bot, Zap } from "lucide-react-native";
import { Linking, Text, View } from "react-native";
import { BrutalistBadge } from "./ui/brutalist-badge";
import { BrutalistButton } from "./ui/brutalist-button";
import { TechBadge } from "./ui/tech-badge";

const techStack = ["Next.js 16", "TypeScript", "DDD", "Drizzle", "AI-Ready"];

export function HeroSection() {
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
    <View className="py-16 px-4 bg-white items-center">
      <BrutalistBadge icon={Bot} className="mb-6">
        AI-Optimized Boilerplate
      </BrutalistBadge>

      <Text className="text-3xl font-black uppercase text-center mb-2 text-black">
        Production-Ready
      </Text>
      <View className="bg-black px-4 py-1 mb-2">
        <Text className="text-2xl font-black uppercase text-white">
          Clean Architecture
        </Text>
      </View>
      <Text className="text-2xl font-black uppercase text-gray-500 text-center mb-4">
        Starter
      </Text>

      <Text className="text-base text-center text-gray-600 mb-4 max-w-xs leading-6">
        Next.js + Expo monorepo with Clean Architecture, DDD, and AI-first
        development patterns.
      </Text>

      <View className="flex-row items-center gap-2 mb-8">
        <Zap size={18} color="#eab308" />
        <Text className="text-sm font-semibold text-gray-600">
          Built for Claude Code & Cursor
        </Text>
        <Zap size={18} color="#eab308" />
      </View>

      <View className="gap-3 mb-8 w-full max-w-xs">
        <BrutalistButton size="lg" className="w-full" onPress={openDocs}>
          Get Started
        </BrutalistButton>
        <BrutalistButton size="lg" variant="outline" onPress={openGitHub}>
          View on GitHub →
        </BrutalistButton>
      </View>

      <View className="flex-row flex-wrap justify-center gap-2">
        {techStack.map((tech) => (
          <TechBadge key={tech}>{tech}</TechBadge>
        ))}
      </View>
    </View>
  );
}
