"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../libs/utils";

interface FloatingIconProps {
  icon: LucideIcon;
  delay?: number;
  className?: string;
}

const FloatingIcon = React.forwardRef<HTMLDivElement, FloatingIconProps>(
  ({ icon: Icon, delay = 0, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn("absolute hidden lg:block", className)}
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
  },
);
FloatingIcon.displayName = "FloatingIcon";

export { FloatingIcon };
