"use client";

import { BrutalistBadge } from "@packages/ui/components/brutalist-badge";
import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import { FloatingIcon } from "@packages/ui/components/floating-icon";
import { GridBackground } from "@packages/ui/components/grid-background";
import { ScrollIndicator } from "@packages/ui/components/scroll-indicator";
import { TechBadge } from "@packages/ui/components/tech-badge";
import { motion } from "framer-motion";
import { Bot, Code2, Layers, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const techStack = ["Next.js 16", "TypeScript", "DDD", "Drizzle", "AI-Ready"];

export function HeroSection() {
  const t = useTranslations("home.hero");

  const scrollToFeatures = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <GridBackground />

      <FloatingIcon icon={Bot} delay={0} className="top-24 left-[12%]" />
      <FloatingIcon icon={Code2} delay={1.5} className="top-32 right-[15%]" />
      <FloatingIcon icon={Layers} delay={3} className="bottom-40 left-[18%]" />
      <FloatingIcon
        icon={Sparkles}
        delay={2}
        className="bottom-36 right-[12%]"
      />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <BrutalistBadge icon={Bot}>AI-Optimized Boilerplate</BrutalistBadge>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-8 leading-[1.1]"
          >
            {t("title_part1")}
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 },
              }}
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-5 py-1 mt-2"
            >
              {t("title_emphasis")}
            </motion.span>
            <br />
            <span className="text-gray-600 dark:text-gray-400">
              {t("title_part2")}
            </span>
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-6 text-gray-700 dark:text-gray-300"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex items-center justify-center gap-3 mb-12 text-gray-600 dark:text-gray-400"
          >
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold text-sm md:text-base">
              Built for Claude Code, Cursor & AI assistants
            </span>
            <Zap className="w-5 h-5 text-yellow-500" />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <BrutalistButton size="lg" asChild>
              <Link href="/docs">{t("cta_start")}</Link>
            </BrutalistButton>
            <BrutalistButton size="lg" variant="outline" asChild>
              <Link
                href="https://github.com/axelhamil/nextjs-clean-architecture-starter"
                target="_blank"
              >
                {t("cta_github")} →
              </Link>
            </BrutalistButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {techStack.map((tech) => (
            <TechBadge key={tech}>{tech}</TechBadge>
          ))}
        </motion.div>
      </div>

      <ScrollIndicator
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      />
    </section>
  );
}
