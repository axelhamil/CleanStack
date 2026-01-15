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
            "rounded-2xl border border-border/50 p-6",
            "shadow-lg backdrop-blur-sm",
            isTerminal
              ? "bg-slate-900 dark:bg-slate-950"
              : "bg-slate-900 dark:bg-slate-950",
          )}
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            {title && (
              <span className="ml-3 font-mono text-xs text-slate-400">
                {title}
              </span>
            )}
          </div>

          <pre className="font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-emerald-400">
            <code>{code}</code>
          </pre>
        </div>
      </motion.div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
