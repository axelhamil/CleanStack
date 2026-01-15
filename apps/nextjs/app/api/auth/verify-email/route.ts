import { verifyEmailController } from "@/adapters/controllers/auth/verify-email.controller";

export async function POST(request: Request) {
  return verifyEmailController(request);
}
