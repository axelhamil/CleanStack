"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { cn } from "../libs/utils";

interface CodeBlockProps {
  code: string;
  title?: string;
  variant?: "default" | "terminal";
  className?: string;
}

const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  ({ code, title, variant = "default", className }, ref) => {
    const isTerminal = variant === "terminal";

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className={cn("w-full", className)}
      >
        <div
          className={cn(
            "border-2 border-black dark:border-white p-6",
            isTerminal
              ? "bg-gray-900 dark:bg-gray-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.3)]"
              : "bg-black dark:bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]",
          )}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            {title && (
              <span
                className={cn(
                  "ml-3 font-mono text-xs",
                  isTerminal
                    ? "text-green-400"
                    : "text-green-400 dark:text-green-600",
                )}
              >
                {title}
              </span>
            )}
          </div>

          <pre
            className={cn(
              "font-mono text-xs md:text-sm leading-relaxed overflow-x-auto",
              isTerminal
                ? "text-green-400"
                : "text-green-400 dark:text-green-600",
            )}
          >
            <code>{code}</code>
          </pre>
        </div>
      </motion.div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
