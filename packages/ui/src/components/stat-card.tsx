"use client";

import * as React from "react";
import { cn } from "../libs/utils";

interface StatCardProps {
  value: string;
  label: string;
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ value, label, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4",
          "shadow-sm hover:shadow-md transition-shadow duration-300",
          className,
        )}
      >
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
          {value}
        </div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
      </div>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard };
