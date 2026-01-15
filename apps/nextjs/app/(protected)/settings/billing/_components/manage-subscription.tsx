"use client";

import { BrutalistButton } from "@packages/ui/components/brutalist-button";
import {
  BrutalistCard,
  BrutalistCardContent,
  BrutalistCardDescription,
  BrutalistCardHeader,
  BrutalistCardTitle,
} from "@packages/ui/components/brutalist-card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ManageSubscription() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Failed to open billing portal");
        return;
      }

      window.location.href = data.url;
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <BrutalistCard>
      <BrutalistCardHeader>
        <BrutalistCardTitle>Subscription</BrutalistCardTitle>
        <BrutalistCardDescription>
          Manage your billing and subscription
        </BrutalistCardDescription>
      </BrutalistCardHeader>
      <BrutalistCardContent>
        <BrutalistButton onClick={openPortal} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Manage Subscription
        </BrutalistButton>
      </BrutalistCardContent>
    </BrutalistCard>
  );
}
