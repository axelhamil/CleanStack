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
            "p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm",
            "shadow-md hover:shadow-lg hover:-translate-y-1",
            "transition-all duration-300",
            className,
          )}
        >
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className={className}
      >
        <div
          className={cn(
            "h-full rounded-2xl border border-border/50 bg-card p-6",
            "shadow-lg hover:shadow-xl",
            "transition-all duration-300",
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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4"
            >
              <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
            </motion.div>
            <h3 className="text-xl font-semibold tracking-tight leading-none">
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
