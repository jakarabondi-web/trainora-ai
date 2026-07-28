import { adminOnly } from "../../../../../../lib/server/access";
import { recordApplicantDecision } from "../../../../../../lib/server/applicant-review";
import { apiError } from "../../../../../../lib/server/trainora-store";

const permitted = new Set(["approved", "rejected", "waitlisted", "action_required", "under_review"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id } = await context.params;
    const body = await request.json() as { decision?: string; notes?: string };
    if (!body.decision || !permitted.has(body.decision)) {
      return Response.json({ error: "Select a valid review decision." }, { status: 400 });
    }
    const result = await recordApplicantDecision(id, body.decision, body.notes ?? "", access.user!.email);
    if (!result.ok) return Response.json({ error: result.error, missing: result.missing }, { status: result.status });
    return Response.json({ status: result.decision });
  } catch (error) {
    return apiError(error);
  }
}
