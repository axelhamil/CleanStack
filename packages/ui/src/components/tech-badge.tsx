"use client";

import * as React from "react";
import { cn } from "../libs/utils";

interface TechBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const TechBadge = React.forwardRef<HTMLDivElement, TechBadgeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-2 border-2 border-black/20 dark:border-white/20",
          "text-sm font-medium text-gray-700 dark:text-gray-300",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TechBadge.displayName = "TechBadge";

export { TechBadge };
