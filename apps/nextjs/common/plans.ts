import type { Plan } from "@packages/ui/components/brutalist-pricing-table";

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For getting started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["Up to 3 projects", "Basic analytics", "Community support"],
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
