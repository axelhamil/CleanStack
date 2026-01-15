"use client";

import { DecorativeShape } from "@packages/ui/components/decorative-shape";
import { FeatureCard } from "@packages/ui/components/feature-card";
import { GridBackground } from "@packages/ui/components/grid-background";
import { motion } from "framer-motion";
import { Layers, Lock, Package, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const features = [
  { key: "clean_architecture", icon: Layers },
  { key: "ddd", icon: Sparkles },
  { key: "type_safety", icon: Lock },
  { key: "monorepo", icon: Package },
];

export function FeaturesSection() {
  const t = useTranslations("home.features");

  return (
    <section className="py-24 bg-secondary/20 relative overflow-hidden">
      <GridBackground variant="dots" size={32} />
      <DecorativeShape
        variant="ring"
        size="lg"
        color="primary"
        position="top-10 right-10"
        rotationDirection="clockwise"
        duration={25}
      />
      <DecorativeShape
        variant="blob"
        size="md"
        color="accent"
        position="bottom-10 left-10"
        rotationDirection="counterclockwise"
        duration={20}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
        >
          {t("title")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map(({ key, icon }, index) => (
            <FeatureCard
              key={key}
              icon={icon}
              title={t(`${key}.title`)}
              description={t(`${key}.description`)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
