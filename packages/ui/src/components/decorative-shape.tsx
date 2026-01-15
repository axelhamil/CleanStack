"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "../libs/utils";

interface DecorativeShapeProps {
  variant: "blob" | "circle" | "ring";
  size?: "sm" | "md" | "lg";
  color?: "primary" | "accent" | "secondary" | "teal";
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
      color = "primary",
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

    const colors = {
      primary: "from-primary/30 to-primary/10",
      accent: "from-accent/30 to-accent/10",
      secondary: "from-secondary/50 to-secondary/20",
      teal: "from-teal-400/30 to-teal-400/10",
    };

    const variantClasses = {
      blob: cn(
        "rounded-[40%_60%_70%_30%/40%_50%_60%_50%]",
        "bg-gradient-to-br",
        colors[color],
        "blur-sm",
      ),
      circle: cn("rounded-full", "bg-gradient-to-br", colors[color], "blur-sm"),
      ring: cn("rounded-full", "border-2 border-primary/20", "bg-transparent"),
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
        animate={{
          rotate: rotationDirection === "clockwise" ? 360 : -360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
          scale: {
            duration: duration / 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
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
          "absolute text-6xl font-mono text-primary/5 select-none",
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
