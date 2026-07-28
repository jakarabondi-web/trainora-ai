import { getCurrentUser } from "../../../../lib/server/current-user";
import { apiError } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
