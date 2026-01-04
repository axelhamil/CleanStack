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
          "border-2 border-black/20 dark:border-white/20 p-4",
          className,
        )}
      >
        <div className="text-xl font-black mb-1">{value}</div>
        <div className="text-xs font-medium uppercase text-gray-500">
          {label}
        </div>
      </div>
    );
  },
);
StatCard.displayName = "StatCard";

export { StatCard };
