import { getCurrentUser } from "../../../../../../lib/server/current-user";
import { decideSubmission } from "../../../../../../lib/server/tasks";
import { apiError, audit } from "../../../../../../lib/server/trainora-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || !["reviewer", "admin"].includes(user.role)) {
      return Response.json({ error: "Reviewer access is required." }, { status: 403 });
    }
    const body = await request.json() as { decision?: "approved" | "rejected"; notes?: string; qualityScore?: number };
    if (!body.decision || !["approved", "rejected"].includes(body.decision)) {
      return Response.json({ error: "A decision of approved or rejected is required." }, { status: 400 });
    }
    if (body.decision === "rejected" && !String(body.notes ?? "").trim()) {
      return Response.json({ error: "Written feedback is required when requesting a revision." }, { status: 400 });
    }
    const { id: submissionId } = await context.params;
    await decideSubmission(user.id, submissionId, body.decision, String(body.notes ?? ""), body.qualityScore);
    await audit(user.id, `submission.${body.decision}`, "task_submission", submissionId, {});
    return Response.json({ status: body.decision });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("not connected")) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    return apiError(error);
  }
}
