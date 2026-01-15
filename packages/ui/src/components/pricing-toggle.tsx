"use client";

import { cn } from "../libs/utils";

interface PricingToggleProps {
  interval: "month" | "year";
  onChange: (interval: "month" | "year") => void;
  yearlyDiscount?: number;
  className?: string;
}

function PricingToggle({
  interval,
  onChange,
  yearlyDiscount,
  className,
}: PricingToggleProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="inline-flex items-center rounded-full bg-secondary/50 p-1">
        <button
          type="button"
          onClick={() => onChange("month")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            interval === "month"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Monthly
        </button>

        <button
          type="button"
          onClick={() => onChange("year")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all relative",
            interval === "year"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Yearly
          {yearlyDiscount && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
              -{yearlyDiscount}%
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export { PricingToggle };
