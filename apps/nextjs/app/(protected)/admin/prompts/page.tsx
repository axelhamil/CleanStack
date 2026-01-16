import { requireAuth } from "@/adapters/guards/auth.guard";
import { ManagedPromptsTable } from "./_components/managed-prompts-table";

export default async function AdminPromptsPage() {
  await requireAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b-3 border-black dark:border-white pb-4">
        <h1 className="font-black text-3xl uppercase tracking-tight">
          Managed Prompts
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Create, edit, and manage versioned prompts for your AI applications
        </p>
      </div>
      <ManagedPromptsTable />
    </div>
  );
}
