import { getCurrentUser } from "../../../../lib/server/current-user";
import { reviewQueue } from "../../../../lib/server/tasks";
import { apiError } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !["reviewer", "admin"].includes(user.role)) {
      return Response.json({ error: "Reviewer access is required." }, { status: 403 });
    }
    return Response.json({ queue: await reviewQueue() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
