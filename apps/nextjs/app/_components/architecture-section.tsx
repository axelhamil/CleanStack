"use client";

import { GridBackground } from "@packages/ui/components/grid-background";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const architectureDiagram = `┌─ CLEANSTACK ARCHITECTURE ────────────────────┐
│                                               │
│   HTTP Request                                │
│        ↓                                      │
│   ┌──────────────────────────────────────┐   │
│   │  [Adapters]                          │   │
│   │  Controllers & Presenters            │   │
│   └──────────────────────────────────────┘   │
│        ↓                                      │
│   ┌──────────────────────────────────────┐   │
│   │  [Application]                       │   │
│   │  Use Cases & Business Logic          │   │
│   └──────────────────────────────────────┘   │
│        ↓                                      │
│   ┌──────────────────────────────────────┐   │
│   │  [Domain]                            │   │
│   │  Entities & Value Objects            │   │
│   │  Aggregates & Domain Events          │   │
│   └──────────────────────────────────────┘   │
│        ↓                                      │
│   ┌──────────────────────────────────────┐   │
│   │  [Infrastructure]                    │   │
│   │  Database & External APIs            │   │
│   └──────────────────────────────────────┘   │
│                                               │
└───────────────────────────────────────────────┘`;

const layers = [
  { key: "layer_1", delay: 0 },
  { key: "layer_2", delay: 0.1 },
  { key: "layer_3", delay: 0.2 },
  { key: "layer_4", delay: 0.3 },
];

export function ArchitectureSection() {
  const t = useTranslations("home.architecture");

  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-primary/90 to-slate-900 relative overflow-hidden">
      <GridBackground variant="mesh" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
        >
          {t("title")}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl"
        >
          <motion.pre
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-emerald-400 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto"
          >
            {architectureDiagram}
          </motion.pre>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 text-white/90"
          >
            <p className="text-base md:text-lg mb-6 font-medium">
              {t("description")}
            </p>
            <ul className="space-y-3">
              {layers.map(({ key, delay }) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 + delay, duration: 0.4 }}
                  className="flex items-start group"
                >
                  <motion.span
                    className="mr-3 text-primary font-bold text-lg"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay,
                    }}
                  >
                    →
                  </motion.span>
                  <span className="text-sm md:text-base text-white/80">
                    {t(key)}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
