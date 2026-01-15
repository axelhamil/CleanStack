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
          "px-4 py-2 rounded-full",
          "border border-border/50 bg-card/50 backdrop-blur-sm",
          "text-sm font-medium text-muted-foreground",
          "hover:border-primary/30 hover:text-foreground transition-all duration-300",
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
