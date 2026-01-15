import { headers } from "next/headers";
import { getInjection } from "@/common/di/container";

export async function handleStripeWebhookController(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return Response.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const useCase = getInjection("HandleStripeWebhookUseCase");
  const result = await useCase.execute({ payload: body, signature });

  if (result.isFailure) {
    console.error("Webhook error:", result.getError());
    return Response.json({ error: result.getError() }, { status: 400 });
  }

  return Response.json(result.getValue());
}
