"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "../libs/utils";

interface DecorativeShapeProps {
  variant: "square" | "outline";
  size?: "sm" | "md" | "lg";
  position: string;
  rotationDirection?: "clockwise" | "counterclockwise";
  duration?: number;
  className?: string;
}

const DecorativeShape = React.forwardRef<HTMLDivElement, DecorativeShapeProps>(
  (
    {
      variant,
      size = "md",
      position,
      rotationDirection = "clockwise",
      duration = 20,
      className,
    },
    ref,
  ) => {
    const sizes = {
      sm: "w-16 h-16",
      md: "w-24 h-24",
      lg: "w-32 h-32",
    };

    const variantClasses = {
      square: "bg-black dark:bg-white",
      outline: "border-4 border-black dark:border-white",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute",
          sizes[size],
          variantClasses[variant],
          position,
          className,
        )}
        animate={{ rotate: rotationDirection === "clockwise" ? 360 : -360 }}
        transition={{
          duration,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    );
  },
);
DecorativeShape.displayName = "DecorativeShape";

interface FloatingSymbolProps {
  symbol: string;
  position: string;
  delay?: number;
  className?: string;
}

const FloatingSymbol = React.forwardRef<HTMLDivElement, FloatingSymbolProps>(
  ({ symbol, position, delay = 0, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute text-6xl font-mono text-black/5 dark:text-white/5 select-none",
          position,
          className,
        )}
        animate={{ rotate: [0, 10, 0], y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, delay }}
      >
        {symbol}
      </motion.div>
    );
  },
);
FloatingSymbol.displayName = "FloatingSymbol";

export { DecorativeShape, FloatingSymbol };
