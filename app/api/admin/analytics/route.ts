import { getPlatformAnalytics } from "../../../../lib/platform-data";

export async function GET() {
  return Response.json({
    source: "trainora-analytics-service",
    generatedAt: new Date().toISOString(),
    window: "7d",
    data: getPlatformAnalytics(),
  }, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
