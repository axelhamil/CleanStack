"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../libs/utils";

interface FloatingIconProps {
  icon: LucideIcon;
  delay?: number;
  color?: "primary" | "accent" | "muted";
  className?: string;
}

const FloatingIcon = React.forwardRef<HTMLDivElement, FloatingIconProps>(
  ({ icon: Icon, delay = 0, color = "primary", className }, ref) => {
    const colorClasses = {
      primary: "text-primary/20",
      accent: "text-accent/20",
      muted: "text-muted-foreground/10",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute hidden lg:flex items-center justify-center",
          "w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5",
          "backdrop-blur-sm",
          className,
        )}
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Icon
          className={cn("w-8 h-8", colorClasses[color])}
          strokeWidth={1.5}
        />
      </motion.div>
    );
  },
);
FloatingIcon.displayName = "FloatingIcon";

export { FloatingIcon };
