import { getCurrentUser } from "../../../../lib/server/current-user";
import { createProject, listProjects, organizationForUser } from "../../../../lib/server/client-portal";
import { apiError, audit } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const organization = await organizationForUser(user.id);
    if (!organization) return Response.json({ error: "No client organization is linked to this account." }, { status: 404 });
    return Response.json({ projects: await listProjects(organization.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const organization = await organizationForUser(user.id);
    if (!organization) return Response.json({ error: "No client organization is linked to this account." }, { status: 404 });
    const body = await request.json() as Record<string, unknown>;
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim();
    const discipline = String(body.discipline ?? "").trim();
    if (!title || !description || !discipline) {
      return Response.json({ error: "Title, description, and discipline are required." }, { status: 400 });
    }
    const projectId = await createProject(organization.id, user.id, {
      title,
      description,
      discipline,
      budgetCents: Math.max(0, Math.round(Number(body.budgetCents ?? 0))),
      requiredQualityScore: Math.min(100, Math.max(0, Number(body.requiredQualityScore ?? 85))),
    });
    await audit(user.id, "project.created", "project", projectId, { organizationId: organization.id });
    return Response.json({ id: projectId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
