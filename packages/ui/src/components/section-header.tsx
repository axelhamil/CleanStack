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
  gradient?: boolean;
  className?: string;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      title,
      subtitle,
      badge,
      centered = true,
      inverted = false,
      gradient = false,
      className,
    },
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
              "inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full",
              inverted
                ? "bg-white/10 border border-white/20 text-white"
                : "bg-secondary/50 border border-border/50 text-foreground",
            )}
          >
            {Badge && <Badge className="w-4 h-4" />}
            <span className="font-medium text-xs tracking-wide">
              {badge.text}
            </span>
          </div>
        )}

        <h2
          className={cn(
            "text-3xl md:text-5xl font-bold mb-6",
            inverted && "text-white",
            gradient &&
              "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
          )}
        >
          {title}
        </h2>

        {subtitle && (
          <p
            className={cn(
              "text-lg max-w-2xl leading-relaxed",
              centered && "mx-auto",
              inverted ? "text-white/70" : "text-muted-foreground",
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
