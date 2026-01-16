import { getUsageStatsController } from "@/adapters/controllers/llm/get-usage-stats.controller";

export async function GET(request: Request) {
  return getUsageStatsController(request);
}
