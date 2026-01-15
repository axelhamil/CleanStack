import { createPortalSessionController } from "@/adapters/controllers/billing/create-portal-session.controller";

export async function POST() {
  return createPortalSessionController();
}
