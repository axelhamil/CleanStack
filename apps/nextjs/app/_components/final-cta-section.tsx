"use client";

import { BrutalistButton } from "@packages/ui/components/ui/brutalist-button";
import { motion } from "framer-motion";
import { ArrowRight, Github, Rocket, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function FinalCTASection() {
  const t = useTranslations("home.cta");

  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-100 dark:from-black dark:to-gray-950 border-t-4 border-black dark:border-white relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-300/20 dark:bg-yellow-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-300/20 dark:bg-blue-600/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Floating icons */}
      <FloatingElement delay={0} className="top-20 left-[15%]">
        <Star className="w-8 h-8 text-yellow-500" fill="currentColor" />
      </FloatingElement>
      <FloatingElement delay={1} className="top-32 right-[20%]">
        <Sparkles className="w-8 h-8 text-blue-500" />
      </FloatingElement>
      <FloatingElement delay={2} className="bottom-32 left-[25%]">
        <Rocket className="w-8 h-8 text-purple-500" />
      </FloatingElement>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-8"
            animate={{ rotate: [0, 5, 0, -5, 0] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Sparkles
              className="w-16 h-16 text-yellow-500 mx-auto"
              strokeWidth={2}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl font-black uppercase mb-6 leading-tight"
          >
            {t("title")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-medium"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <BrutalistButton
                size="lg"
                className="group relative overflow-hidden"
                asChild
              >
                <Link href="/docs/getting-started">
                  <span className="relative z-10 flex items-center gap-2">
                    {t("button")}
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 dark:from-yellow-600 dark:to-yellow-800"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                </Link>
              </BrutalistButton>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <BrutalistButton size="lg" variant="outline" asChild>
                <Link
                  href="https://github.com/axelhamil/nextjs-clean-architecture-starter"
                  target="_blank"
                  className="flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Star on GitHub
                </Link>
              </BrutalistButton>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { label: "TypeScript", value: "100%" },
              { label: "AI-Ready", value: "✨" },
              { label: "Production", value: "Ready" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                className="border-3 border-black dark:border-white p-4 bg-white dark:bg-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all"
              >
                <div className="text-3xl font-black mb-2">{stat.value}</div>
                <div className="text-sm font-bold uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingElement({
  children,
  delay,
  className,
}: {
  children: React.ReactNode;
  delay: number;
  className: string;
}) {
  return (
    <motion.div
      className={`absolute ${className} hidden lg:block`}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 10, 0],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
