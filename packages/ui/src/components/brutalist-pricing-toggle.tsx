"use client";

import { cn } from "../libs/utils";

interface BrutalistPricingToggleProps {
  interval: "month" | "year";
  onChange: (interval: "month" | "year") => void;
  yearlyDiscount?: number;
  className?: string;
}

function BrutalistPricingToggle({
  interval,
  onChange,
  yearlyDiscount,
  className,
}: BrutalistPricingToggleProps) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      <button
        type="button"
        onClick={() => onChange("month")}
        className={cn(
          "px-4 py-2 font-bold uppercase text-sm tracking-wide transition-all border-3 border-black dark:border-white",
          interval === "month"
            ? "bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
            : "bg-white text-black dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900",
        )}
      >
        Monthly
      </button>

      <button
        type="button"
        onClick={() => onChange("year")}
        className={cn(
          "px-4 py-2 font-bold uppercase text-sm tracking-wide transition-all border-3 border-black dark:border-white relative",
          interval === "year"
            ? "bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
            : "bg-white text-black dark:bg-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900",
        )}
      >
        Yearly
        {yearlyDiscount && (
          <span className="absolute -top-2 -right-2 bg-yellow-300 dark:bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 border-2 border-black dark:border-white">
            -{yearlyDiscount}%
          </span>
        )}
      </button>
    </div>
  );
}

export { BrutalistPricingToggle };
