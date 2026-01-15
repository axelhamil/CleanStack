import type { ReactNode } from "react";
import { PricingSection } from "./_components/pricing-section";

export default function PricingPage(): ReactNode {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. No hidden fees, cancel
            anytime.
          </p>
        </div>
        <PricingSection />
      </div>
    </main>
  );
}
