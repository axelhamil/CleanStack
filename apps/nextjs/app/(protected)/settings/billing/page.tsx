import { requireAuth } from "@/adapters/guards/auth.guard";
import { ManageSubscription } from "./_components/manage-subscription";

export default async function BillingSettingsPage() {
  await requireAuth();

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Billing Settings</h1>
      <ManageSubscription />
    </div>
  );
}
