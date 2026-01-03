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
      {/* Animated Grid Background */}
      <motion.div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)",
          backgroundSize: "50px 50px",
        }}
        animate={{
          backgroundPosition: ["0px 0px", "50px 50px"],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {/* Floating Elements */}
      <FloatingIcon
        icon={Bot}
        delay={0}
        x={-20}
        y={-30}
        className="top-20 left-[10%]"
      />
      <FloatingIcon
        icon={Code2}
        delay={1}
        x={20}
        y={-20}
        className="top-40 right-[15%]"
      />
      <FloatingIcon
        icon={Layers}
        delay={2}
        x={-15}
        y={25}
        className="bottom-40 left-[20%]"
      />
      <FloatingIcon
        icon={Sparkles}
        delay={1.5}
        x={15}
        y={-25}
        className="bottom-32 right-[10%]"
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* AI-Friendly Badge with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8 py-2 px-6 border-4 border-black dark:border-white bg-yellow-300 dark:bg-yellow-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
        >
          <Bot className="w-5 h-5" strokeWidth={3} />
          <span className="font-black uppercase tracking-wider text-sm">
            {t("badge")} - AI-Optimized
          </span>
          <Sparkles className="w-5 h-5" strokeWidth={3} />
        </motion.div>

        {/* Main Title with Stagger Animation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight mb-6"
          >
            {t("title_part1")}
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, rotate: -5, scale: 0.8 },
                visible: { opacity: 1, rotate: -2, scale: 1 },
              }}
              className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
            >
              {t("title_emphasis")}
            </motion.span>
            <br />
            {t("title_part2")}
          </motion.h1>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto mb-4 font-medium"
          >
            {t("subtitle")}
          </motion.p>

          {/* AI-Friendly Tagline */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12 flex items-center justify-center gap-2"
          >
            <Zap className="w-6 h-6 text-yellow-500" />
            <span className="font-bold">
              Built for Claude Code, Cursor & AI assistants
            </span>
            <Zap className="w-6 h-6 text-yellow-500" />
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <BrutalistButton size="lg" className="relative group" asChild>
              <Link href="/docs/getting-started">
                <span className="relative z-10">{t("cta_start")}</span>
                <motion.div
                  className="absolute inset-0 bg-yellow-300 dark:bg-yellow-600 -z-10"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </Link>
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

        {/* Tech Stack Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto"
        >
          {["Next.js 16", "TypeScript", "DDD", "Drizzle ORM", "AI-Ready"].map(
            (tech, index) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{
                  y: -4,
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,1)",
                }}
                className="px-4 py-3 border-3 border-black dark:border-white bg-white dark:bg-black font-bold uppercase text-sm hover:bg-yellow-100 dark:hover:bg-yellow-900 transition-colors cursor-default"
              >
                {tech}
              </motion.div>
            ),
          )}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToFeatures}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black dark:text-white cursor-pointer group"
        whileHover={{ y: 5 }}
      >
        <span className="font-bold uppercase text-sm">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <ChevronDown
            className="w-8 h-8 group-hover:scale-110 transition-transform"
            strokeWidth={3}
          />
        </motion.div>
      </motion.button>
    </section>
  );
}

// Floating Icon Component
function FloatingIcon({
  icon: Icon,
  delay,
  x,
  y,
  className,
}: {
  icon: React.ElementType;
  delay: number;
  x: number;
  y: number;
  className: string;
}) {
  return (
    <motion.div
      className={`absolute ${className} hidden lg:block`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        x: [0, x, 0],
        y: [0, y, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <Icon className="w-16 h-16 text-black dark:text-white" strokeWidth={2} />
    </motion.div>
  );
}
