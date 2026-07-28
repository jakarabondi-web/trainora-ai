import { adminOnly } from "../../../../lib/server/access";
import { listUsers } from "../../../../lib/server/admin-users";
import { apiError } from "../../../../lib/server/trainora-store";

export async function GET(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const url = new URL(request.url);
    const role = url.searchParams.get("role") ?? undefined;
    const query = url.searchParams.get("query") ?? undefined;
    return Response.json({ users: await listUsers({ role, query }) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
