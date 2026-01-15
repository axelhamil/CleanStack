"use client";

import { ScrollIndicator } from "@packages/ui/components/scroll-indicator";
import { Badge } from "@packages/ui/components/ui/badge";
import { Button } from "@packages/ui/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Github, Terminal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const techStack = [
  "Next.js 16",
  "TypeScript",
  "Clean Architecture",
  "DDD",
  "AI-Ready",
];

export function HeroSection() {
  const t = useTranslations("home.hero");

  const scrollToFeatures = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Gradient background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[128px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm font-medium border-white/10 bg-white/5 text-neutral-300 backdrop-blur-sm"
          >
            <Terminal className="w-3.5 h-3.5 mr-2 text-violet-400" />
            AI-Optimized Development
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white mb-6 leading-[1.1]"
        >
          {t("title_part1")}
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
            {t("title_emphasis")}
          </span>
          <br />
          <span className="text-neutral-500">{t("title_part2")}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>

        {/* AI mention */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-sm text-neutral-500 mb-10"
        >
          Built for <span className="text-neutral-300">Claude Code</span>,{" "}
          <span className="text-neutral-300">Cursor</span> &{" "}
          <span className="text-neutral-300">AI assistants</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Button
            size="lg"
            asChild
            className="h-12 px-6 text-sm font-medium bg-white text-black hover:bg-neutral-200 transition-colors rounded-lg"
          >
            <Link href="/docs" className="flex items-center gap-2">
              {t("cta_start")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 px-6 text-sm font-medium border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white transition-colors rounded-lg"
          >
            <Link
              href="https://github.com/axelhamil/nextjs-clean-architecture-starter"
              target="_blank"
              className="flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              {t("cta_github")}
            </Link>
          </Button>
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {techStack.map((tech, index) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 bg-white/5 border border-white/5 rounded-md"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator
        onClick={scrollToFeatures}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-500 hover:text-neutral-300"
      />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
