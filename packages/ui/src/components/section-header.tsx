"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../libs/utils";

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  badge?: {
    icon?: LucideIcon;
    text: string;
  };
  centered?: boolean;
  inverted?: boolean;
  className?: string;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    { title, subtitle, badge, centered = true, inverted = false, className },
    ref,
  ) => {
    const Badge = badge?.icon;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(centered && "text-center", "mb-16", className)}
      >
        {badge && (
          <div
            className={cn(
              "inline-flex items-center gap-2 mb-6 px-4 py-2 border-2",
              inverted
                ? "border-white bg-white/10"
                : "border-black dark:border-white bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50",
            )}
          >
            {Badge && <Badge className="w-4 h-4" />}
            <span className="font-bold uppercase text-xs tracking-wide">
              {badge.text}
            </span>
          </div>
        )}

        <h2
          className={cn(
            "text-3xl md:text-5xl font-black uppercase mb-6",
            inverted && "text-white dark:text-black",
          )}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className={cn(
              "text-lg max-w-2xl leading-relaxed",
              centered && "mx-auto",
              inverted
                ? "text-gray-300 dark:text-gray-600"
                : "text-gray-600 dark:text-gray-400",
            )}
          >
            {subtitle}
          </p>
        )}
      </motion.div>
    );
  },
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
