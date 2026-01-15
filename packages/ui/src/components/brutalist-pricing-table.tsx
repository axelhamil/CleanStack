"use client";

import { useState } from "react";
import { cn } from "../libs/utils";
import { BrutalistPricingCard } from "./brutalist-pricing-card";
import { BrutalistPricingToggle } from "./brutalist-pricing-toggle";

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  priceId: {
    monthly: string;
    yearly: string;
  };
}

interface BrutalistPricingTableProps {
  plans: Plan[];
  onSelectPlan: (priceId: string) => void;
  loading?: string;
  yearlyDiscount?: number;
  className?: string;
}

function BrutalistPricingTable({
  plans,
  onSelectPlan,
  loading,
  yearlyDiscount = 20,
  className,
}: BrutalistPricingTableProps) {
  const [interval, setInterval] = useState<"month" | "year">("month");

  return (
    <div className={cn("space-y-8", className)}>
      <BrutalistPricingToggle
        interval={interval}
        onChange={setInterval}
        yearlyDiscount={yearlyDiscount}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
        {plans.map((plan) => {
          const currentPriceId =
            interval === "month" ? plan.priceId.monthly : plan.priceId.yearly;
          return (
            <BrutalistPricingCard
              key={plan.id}
              name={plan.name}
              description={plan.description}
              price={
                interval === "month" ? plan.monthlyPrice : plan.yearlyPrice
              }
              interval={interval}
              features={plan.features}
              highlighted={plan.highlighted}
              ctaText={plan.monthlyPrice === 0 ? "Get Started" : "Subscribe"}
              onSelect={() => onSelectPlan(currentPriceId)}
              loading={loading === currentPriceId}
            />
          );
        })}
      </div>
    </div>
  );
}

export { BrutalistPricingTable };
export type { Plan };
