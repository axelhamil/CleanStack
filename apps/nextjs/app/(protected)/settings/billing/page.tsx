import { requireAuth } from "@/adapters/guards/auth.guard";
import { ManageSubscription } from "./_components/manage-subscription";

export default async function BillingSettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <ManageSubscription />
    </div>
  );
}
