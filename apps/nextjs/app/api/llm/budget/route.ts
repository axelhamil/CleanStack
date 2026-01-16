import { checkBudgetController } from "@/adapters/controllers/llm/check-budget.controller";

export async function GET(request: Request) {
  return checkBudgetController(request);
}
