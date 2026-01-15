"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../libs/utils";
import { BrutalistButton } from "./brutalist-button";

const brutalistPricingCardVariants = cva(
  "border-3 border-black dark:border-white bg-white dark:bg-black p-6 relative",
  {
    variants: {
      highlighted: {
        true: "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] scale-105 z-10",
        false:
          "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]",
      },
    },
    defaultVariants: { highlighted: false },
  },
);

interface BrutalistPricingCardProps
  extends VariantProps<typeof brutalistPricingCardVariants> {
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  ctaText: string;
  onSelect: () => void;
  loading?: boolean;
  className?: string;
}

function BrutalistPricingCard({
  name,
  description,
  price,
  interval,
  features,
  highlighted,
  ctaText,
  onSelect,
  loading,
  className,
}: BrutalistPricingCardProps) {
  return (
    <div
      className={cn(
        brutalistPricingCardVariants({ highlighted }),
        "flex flex-col h-full",
        className,
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="bg-yellow-300 dark:bg-yellow-500 border-3 border-black dark:border-white px-4 py-1">
            <span className="text-xs font-bold uppercase tracking-wide text-black">
              Most Popular
            </span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold uppercase tracking-tight">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-5xl font-black">${price}</span>
        <span className="text-muted-foreground ml-1">/{interval}</span>
      </div>

      <ul className="space-y-3 flex-1 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className="border-2 border-black dark:border-white p-0.5 mt-0.5">
              <Check className="h-3 w-3" strokeWidth={3} />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <BrutalistButton
        className="w-full"
        variant={highlighted ? "dark" : "default"}
        onClick={onSelect}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {ctaText}
      </BrutalistButton>
    </div>
  );
}

export { BrutalistPricingCard, brutalistPricingCardVariants };
