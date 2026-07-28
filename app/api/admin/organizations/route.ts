import { adminOnly } from "../../../../lib/server/access";
import { apiError, database } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const result = await database().prepare(
      `SELECT o.id, o.name,
        (SELECT COALESCE(SUM(spent_cents), 0) FROM projects p WHERE p.organization_id = o.id) AS spent_cents
       FROM organizations o ORDER BY o.created_at DESC LIMIT 200`,
    ).all();
    return Response.json({ organizations: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
