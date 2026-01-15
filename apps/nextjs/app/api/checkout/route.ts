import { createCheckoutSessionController } from "@/adapters/controllers/billing/create-checkout-session.controller";

export async function POST(request: Request) {
  return createCheckoutSessionController(request);
}
