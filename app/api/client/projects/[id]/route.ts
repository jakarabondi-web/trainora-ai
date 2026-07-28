import { getCurrentUser } from "../../../../../lib/server/current-user";
import { organizationForUser, projectDetail } from "../../../../../lib/server/client-portal";
import { apiError } from "../../../../../lib/server/trainora-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const organization = await organizationForUser(user.id);
    if (!organization) return Response.json({ error: "No client organization is linked to this account." }, { status: 404 });
    const { id: projectId } = await context.params;
    const detail = await projectDetail(organization.id, projectId);
    if (!detail) return Response.json({ error: "Project not found." }, { status: 404 });
    return Response.json(detail, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
