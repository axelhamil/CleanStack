"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { cn } from "../libs/utils";

interface ScrollIndicatorProps {
  onClick?: () => void;
  label?: string;
  className?: string;
}

const ScrollIndicator = React.forwardRef<
  HTMLButtonElement,
  ScrollIndicatorProps
>(({ onClick, label = "Scroll", className }, ref) => {
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className={cn(
        "flex flex-col items-center gap-2 cursor-pointer",
        "text-muted-foreground",
        "hover:text-primary transition-colors",
        className,
      )}
    >
      <span className="font-medium text-xs tracking-wide">{label}</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <ChevronDown className="w-6 h-6" strokeWidth={2} />
      </motion.div>
    </motion.button>
  );
});
ScrollIndicator.displayName = "ScrollIndicator";

export { ScrollIndicator };
