import { adminOnly } from "../../../../lib/server/access";
import { apiError, database } from "../../../../lib/server/trainora-store";

export async function GET(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const limit = Math.min(200, Math.max(1, Number(new URL(request.url).searchParams.get("limit") ?? 50)));
    const result = await database().prepare(
      `SELECT id, actor_id, action, entity_type, entity_id, metadata_json, created_at
       FROM audit_events ORDER BY created_at DESC LIMIT ?`,
    ).bind(limit).all();
    return Response.json({ events: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

