import { ScrollView } from "react-native";
import { AIFeaturesSection } from "@/components/ai-features-section";
import { ArchitectureSection } from "@/components/architecture-section";
import { CTASection } from "@/components/cta-section";
import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <HeroSection />
      <AIFeaturesSection />
      <FeaturesSection />
      <ArchitectureSection />
      <CTASection />
    </ScrollView>
  );
}
