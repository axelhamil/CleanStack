"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../libs/utils";

const brutalistBadgeVariants = cva(
  "inline-flex items-center gap-2 font-bold uppercase text-xs tracking-wide",
  {
    variants: {
      variant: {
        default:
          "py-2 px-5 border-3 border-black dark:border-white bg-yellow-300 dark:bg-yellow-500 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.5)]",
        gradient:
          "px-4 py-2 border-2 border-black dark:border-white bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50",
        subtle:
          "px-4 py-2 border-2 border-black/20 dark:border-white/20 text-gray-700 dark:text-gray-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

interface BrutalistBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof brutalistBadgeVariants> {
  icon?: LucideIcon;
}

const BrutalistBadge = React.forwardRef<HTMLDivElement, BrutalistBadgeProps>(
  ({ className, variant, icon: Icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(brutalistBadgeVariants({ variant, className }))}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" strokeWidth={2.5} />}
        <span>{children}</span>
      </div>
    );
  },
);
BrutalistBadge.displayName = "BrutalistBadge";

export { BrutalistBadge, brutalistBadgeVariants };
