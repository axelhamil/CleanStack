import { handleStripeWebhookController } from "@/adapters/controllers/billing/handle-stripe-webhook.controller";

export async function POST(request: Request) {
  return handleStripeWebhookController(request);
}
