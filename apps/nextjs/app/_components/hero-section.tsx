"use client";

import { BrutalistButton } from "@packages/ui/components/ui/brutalist-button";
import { motion } from "framer-motion";
import { Bot, ChevronDown, Code2, Layers, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("home.hero");

  const scrollToFeatures = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Elements - subtle */}
      <FloatingIcon icon={Bot} delay={0} className="top-24 left-[12%]" />
      <FloatingIcon icon={Code2} delay={1.5} className="top-32 right-[15%]" />
      <FloatingIcon icon={Layers} delay={3} className="bottom-40 left-[18%]" />
      <FloatingIcon
        icon={Sparkles}
        delay={2}
        className="bottom-36 right-[12%]"
      />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-5xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-10 py-2 px-5 border-3 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]"
        >
          <Bot className="w-4 h-4" strokeWidth={2.5} />
          <span className="font-bold uppercase tracking-wide text-xs">
            AI-Optimized Boilerplate
          </span>
        </motion.div>

        {/* Main Title */}
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

          {/* AI Tagline */}
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

          {/* CTA Buttons */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <BrutalistButton size="lg" asChild>
              <Link href="/docs/getting-started">{t("cta_start")}</Link>
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

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {["Next.js 16", "TypeScript", "DDD", "Drizzle", "AI-Ready"].map(
            (tech) => (
              <div
                key={tech}
                className="px-4 py-2 border-2 border-black/20 dark:border-white/20 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {tech}
              </div>
            ),
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToFeatures}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-black dark:hover:text-white transition-colors"
      >
        <span className="font-medium text-xs uppercase tracking-wide">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-6 h-6" strokeWidth={2} />
        </motion.div>
      </motion.button>
    </section>
  );
}

function FloatingIcon({
  icon: Icon,
  delay,
  className,
}: {
  icon: React.ElementType;
  delay: number;
  className: string;
}) {
  return (
    <motion.div
      className={`absolute ${className} hidden lg:block`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.05, 0.15, 0.05],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 5,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <Icon
        className="w-12 h-12 text-black dark:text-white"
        strokeWidth={1.5}
      />
    </motion.div>
  );
}
