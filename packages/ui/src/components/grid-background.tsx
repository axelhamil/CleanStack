"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "../libs/utils";

interface GridBackgroundProps {
  animated?: boolean;
  size?: number;
  className?: string;
}

const GridBackground = React.forwardRef<HTMLDivElement, GridBackgroundProps>(
  ({ animated = false, size = 60, className }, ref) => {
    const style = {
      backgroundImage:
        "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
      backgroundSize: `${size}px ${size}px`,
    };

    if (animated) {
      return (
        <motion.div
          ref={ref}
          className={cn("absolute inset-0 opacity-10", className)}
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: `${size}px ${size}px`,
          }}
          animate={{
            backgroundPosition: ["0px 0px", `${size}px ${size}px`],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 opacity-[0.03] dark:opacity-[0.05]",
          className,
        )}
        style={style}
      />
    );
  },
);
GridBackground.displayName = "GridBackground";

export { GridBackground };
