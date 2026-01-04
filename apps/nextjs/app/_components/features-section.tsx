"use client";

import { DecorativeShape } from "@packages/ui/components/decorative-shape";
import { FeatureCard } from "@packages/ui/components/feature-card";
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
    <section className="py-24 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      <DecorativeShape
        variant="outline"
        size="lg"
        position="top-10 right-10"
        rotationDirection="clockwise"
        duration={20}
      />
      <DecorativeShape
        variant="square"
        size="md"
        position="bottom-10 left-10"
        rotationDirection="counterclockwise"
        duration={15}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black uppercase text-center mb-16"
        >
          {t("title")}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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
