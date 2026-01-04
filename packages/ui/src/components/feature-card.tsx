"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../libs/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  variant?: "default" | "compact";
  className?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  (
    {
      icon: Icon,
      title,
      description,
      index = 0,
      variant = "default",
      className,
    },
    ref,
  ) => {
    if (variant === "compact") {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className={cn(
            "p-6 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900",
            "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]",
            "transition-shadow",
            className,
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-black dark:bg-white rounded-sm shrink-0">
              <Icon className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase mb-2">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className={className}
      >
        <div
          className={cn(
            "h-full border-3 border-black dark:border-white bg-white dark:bg-black p-6",
            "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
            "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]",
            "transition-all",
          )}
        >
          <div className="flex flex-col space-y-1.5 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.1 + 0.2,
                type: "spring",
                stiffness: 200,
              }}
            >
              <Icon className="w-12 h-12 mb-4" strokeWidth={3} />
            </motion.div>
            <h3 className="text-2xl font-bold uppercase tracking-tight leading-none">
              {title}
            </h3>
          </div>
          <p className="text-base text-muted-foreground">{description}</p>
        </div>
      </motion.div>
    );
  },
);
FeatureCard.displayName = "FeatureCard";

export { FeatureCard };
