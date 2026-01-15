"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "../libs/utils";

interface GridBackgroundProps {
  animated?: boolean;
  size?: number;
  variant?: "dots" | "grid" | "mesh";
  className?: string;
}

const GridBackground = React.forwardRef<HTMLDivElement, GridBackgroundProps>(
  ({ animated = false, size = 40, variant = "dots", className }, ref) => {
    if (variant === "mesh") {
      return (
        <div
          ref={ref}
          className={cn(
            "absolute inset-0 opacity-30",
            "bg-gradient-to-br from-primary/10 via-transparent to-accent/10",
            className,
          )}
        />
      );
    }

    if (variant === "dots") {
      const dotStyle = {
        backgroundImage:
          "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        backgroundSize: `${size}px ${size}px`,
      };

      if (animated) {
        return (
          <motion.div
            ref={ref}
            className={cn("absolute inset-0 text-primary/10", className)}
            style={dotStyle}
            animate={{
              backgroundPosition: ["0px 0px", `${size}px ${size}px`],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        );
      }

      return (
        <div
          ref={ref}
          className={cn("absolute inset-0 text-foreground/[0.03]", className)}
          style={dotStyle}
        />
      );
    }

    // Grid variant
    const gridStyle = {
      backgroundImage:
        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
      backgroundSize: `${size}px ${size}px`,
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn("absolute inset-0 text-primary/10", className)}
          style={gridStyle}
          animate={{
            backgroundPosition: ["0px 0px", `${size}px ${size}px`],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn("absolute inset-0 text-foreground/[0.02]", className)}
        style={gridStyle}
      />
    );
  },
);
GridBackground.displayName = "GridBackground";

export { GridBackground };
