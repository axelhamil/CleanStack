"use client";

import { PricingTable } from "@packages/ui/components/pricing-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/common/auth-client";
import { plans } from "@/common/plans";

export function PricingSection() {
  const [loading, setLoading] = useState<string>();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  async function handleSelectPlan(priceId: string) {
    if (!priceId) {
      router.push("/signup");
      return;
    }

    if (!session) {
      router.push(`/signup?redirect=/pricing&priceId=${priceId}`);
      return;
    }

    setLoading(priceId);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Failed to create checkout session");
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
