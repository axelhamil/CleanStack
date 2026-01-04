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
    <section className="py-24 bg-black dark:bg-white relative overflow-hidden">
      <GridBackground animated size={40} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black uppercase text-center mb-16 text-white dark:text-black"
        >
          {t("title")}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto border-4 border-white dark:border-black bg-black dark:bg-white p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] dark:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <motion.pre
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-green-400 dark:text-green-600 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto"
          >
            {architectureDiagram}
          </motion.pre>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-8 text-white dark:text-black"
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
                    className="mr-3 font-black text-lg"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay,
                    }}
                  >
                    →
                  </motion.span>
                  <span className="text-sm md:text-base">{t(key)}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
