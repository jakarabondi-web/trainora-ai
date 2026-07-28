import { getCurrentUser } from "../../../../lib/server/current-user";
import { trainerEarningsSummary } from "../../../../lib/server/payments";
import { apiError } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    return Response.json(await trainerEarningsSummary(user.id), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
