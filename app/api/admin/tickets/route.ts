import { adminOnly } from "../../../../lib/server/access";
import { apiError, database } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const result = await database().prepare(
      `SELECT t.*, u.full_name AS user_name, u.email AS user_email FROM support_tickets t
       JOIN users u ON u.id = t.user_id ORDER BY t.updated_at DESC LIMIT 200`,
    ).all();
    return Response.json({ tickets: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
