import type { ReactNode } from "react";
import { AIFeaturesSection } from "./_components/ai-features-section";
import { ArchitectureSection } from "./_components/architecture-section";
import { CodeExamplesSection } from "./_components/code-examples-section";
import { FeaturesSection } from "./_components/features-section";
import { FinalCTASection } from "./_components/final-cta-section";
import { Footer } from "./_components/footer";
import { HeroSection } from "./_components/hero-section";

export default function Home(): ReactNode {
  return (
    <main className="bg-background text-foreground">
      <HeroSection />
      <AIFeaturesSection />
      <FeaturesSection />
      <ArchitectureSection />
      <CodeExamplesSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
