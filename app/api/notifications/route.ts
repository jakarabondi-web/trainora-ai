import { getCurrentUser } from "../../../lib/server/current-user";
import { apiError, database } from "../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const db = database();
    const result = await db.prepare(
      `SELECT id, type, title, message, action_url, read_at, created_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
    ).bind(user.id).all();
    return Response.json({ notifications: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
