"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Check, Loader2 } from "lucide-react";
import { cn } from "../libs/utils";
import { Button } from "./ui/button";

const pricingCardVariants = cva(
  "rounded-2xl border bg-card p-6 relative transition-all duration-300",
  {
    variants: {
      highlighted: {
        true: "border-primary shadow-lg scale-105 z-10",
        false:
          "border-border/50 shadow-md hover:shadow-lg hover:-translate-y-1",
      },
    },
    defaultVariants: { highlighted: false },
  },
);

interface PricingCardProps extends VariantProps<typeof pricingCardVariants> {
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

function PricingCard({
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
}: PricingCardProps) {
  return (
    <div
      className={cn(
        pricingCardVariants({ highlighted }),
        "flex flex-col h-full",
        className,
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full">
            <span className="text-xs font-medium">Most Popular</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">${price}</span>
        <span className="text-muted-foreground ml-1">/{interval}</span>
      </div>

      <ul className="space-y-3 flex-1 mb-6">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
              <Check className="h-3 w-3 text-primary" strokeWidth={3} />
            </div>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="w-full"
        variant={highlighted ? "default" : "outline"}
        onClick={onSelect}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {ctaText}
      </Button>
    </div>
  );
}

export { PricingCard, pricingCardVariants };
