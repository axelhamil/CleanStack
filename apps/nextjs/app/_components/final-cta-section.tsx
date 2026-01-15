"use client";

import { StatCard } from "@packages/ui/components/stat-card";
import { Button } from "@packages/ui/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const stats = [
  { label: "TypeScript", value: "100%" },
  { label: "AI-Ready", value: "Yes" },
  { label: "Production", value: "Ready" },
];

export function FinalCTASection() {
  const t = useTranslations("home.cta");

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/30 border-t border-border/30">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("title")}</h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            {t("subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" variant="glow" asChild>
              <Link
                href="/docs/getting-started"
                className="flex items-center gap-2"
              >
                {t("button")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link
                href="https://github.com/axelhamil/nextjs-clean-architecture-starter"
                target="_blank"
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Star on GitHub
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
