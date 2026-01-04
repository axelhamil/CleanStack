"use client";

import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { cn } from "../libs/utils";

interface Tab {
  id: string;
  label: string;
}

interface BrutalistTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const BrutalistTabs = React.forwardRef<HTMLDivElement, BrutalistTabsProps>(
  ({ tabs, activeTab, onTabChange, className }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={cn("flex gap-4", className)}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            whileHover={{ scale: activeTab !== tab.id ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-6 py-3 border-3 border-black dark:border-white font-bold uppercase text-sm transition-all",
              activeTab === tab.id
                ? "bg-black dark:bg-white text-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                : "bg-white dark:bg-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]",
            )}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>
    );
  },
);
BrutalistTabs.displayName = "BrutalistTabs";

interface BrutalistTabContentProps {
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

const BrutalistTabContent = React.forwardRef<
  HTMLDivElement,
  BrutalistTabContentProps
>(({ activeTab, children, className }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={cn(
        "border-4 border-black dark:border-white bg-black dark:bg-white p-6",
        "shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
});
BrutalistTabContent.displayName = "BrutalistTabContent";

export { BrutalistTabs, BrutalistTabContent };
