import { getCurrentUser } from "../../../../../../lib/server/current-user";
import { addProjectTasks, organizationForUser, projectDetail } from "../../../../../../lib/server/client-portal";
import { apiError, audit } from "../../../../../../lib/server/trainora-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const organization = await organizationForUser(user.id);
    if (!organization) return Response.json({ error: "No client organization is linked to this account." }, { status: 404 });
    const { id: projectId } = await context.params;
    const detail = await projectDetail(organization.id, projectId);
    if (!detail) return Response.json({ error: "Project not found." }, { status: 404 });
    const body = await request.json() as { title?: string; instructions?: string; rateCents?: number; count?: number };
    const title = String(body.title ?? "").trim();
    const instructions = String(body.instructions ?? "").trim();
    if (!title || !instructions) return Response.json({ error: "A title and instructions are required." }, { status: 400 });
    const count = Math.min(200, Math.max(1, Math.round(Number(body.count ?? 1))));
    const rateCents = Math.max(0, Math.round(Number(body.rateCents ?? 0)));
    const tasks = Array.from({ length: count }, (_, index) => ({
      title: count > 1 ? `${title} #${index + 1}` : title,
      instructions,
      rateCents,
    }));
    const created = await addProjectTasks(projectId, tasks);
    await audit(user.id, "project.tasks_created", "project", projectId, { count: created });
    return Response.json({ created }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
