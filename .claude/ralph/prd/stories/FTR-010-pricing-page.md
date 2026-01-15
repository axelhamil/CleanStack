# FTR-010: Pricing Page

## Story

**As a** visitor
**I want** to see pricing plans
**So that** I can choose the right plan

## Acceptance Criteria

- [ ] Pricing page at /pricing
- [ ] Shows all plans with features
- [ ] Monthly/yearly toggle
- [ ] Checkout integration
- [ ] Responsive design

## Implementation

### Page

```typescript
// app/(marketing)/pricing/page.tsx
import { PricingTable } from "@repo/ui";
import { plans } from "@/config/plans";

export default function PricingPage() {
  return (
    <div className="container py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Choose the plan that's right for you
        </p>
      </div>
      <PricingSection />
    </div>
  );
}
```

### Client Component

```typescript
// app/(marketing)/pricing/_components/pricing-section.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingTable } from "@repo/ui";
import { plans } from "@/config/plans";
import { useSession } from "@/hooks/use-session";
import { toast } from "sonner";

export function PricingSection() {
  const [loading, setLoading] = useState<string>();
  const router = useRouter();
  const { session } = useSession();

  async function handleSelectPlan(priceId: string) {
    if (!session) {
      router.push(`/signup?redirect=/pricing&priceId=${priceId}`);
      return;
    }

    setLoading(priceId);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await response.json();

      if (error) {
        toast.error(error);
      } else {
        window.location.href = url;
      }
    } finally {
      setLoading(undefined);
    }
  }

  return (
    <PricingTable
      plans={plans}
      onSelectPlan={handleSelectPlan}
      loading={loading}
    />
  );
}
```

### Plans Config

```typescript
// config/plans.ts
export const plans = [
  {
    id: "free",
    name: "Free",
    description: "For getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Community support",
    ],
    priceId: {
      monthly: "",
      yearly: "",
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams",
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "API access",
      "Custom integrations",
    ],
    highlighted: true,
    priceId: {
      monthly: "price_pro_monthly",
      yearly: "price_pro_yearly",
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      "Everything in Pro",
      "SSO/SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom contracts",
    ],
    priceId: {
      monthly: "price_enterprise_monthly",
      yearly: "price_enterprise_yearly",
    },
  },
];
```

### FAQ Section (optional)

```typescript
// app/(marketing)/pricing/_components/faq.tsx
const faqs = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel your subscription at any time...",
  },
  // ...
];

export function FAQ() {
  return (
    <Accordion type="single" collapsible>
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

## Definition of Done

- [ ] Page created
- [ ] All plans displayed
- [ ] Checkout flow works
- [ ] Mobile responsive
