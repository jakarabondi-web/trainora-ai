import { adminOnly } from "../../../../../../lib/server/access";
import { apiError, audit, database, notify, now } from "../../../../../../lib/server/trainora-store";

const allowed = new Set(["shortlisted", "assigned", "rejected"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id } = await context.params;
    const { decision } = await request.json() as { decision?: string };
    if (!decision || !allowed.has(decision)) return Response.json({ error: "Valid decision required." }, { status: 400 });
    const db = database();
    const record = await db.prepare("SELECT trainer_id, job_id FROM job_applications WHERE id = ?").bind(id).first() as { trainer_id: string; job_id: string } | null;
    if (!record) return Response.json({ error: "Job application not found." }, { status: 404 });
    await db.prepare(
      "UPDATE job_applications SET status = ?, decided_at = ?, decided_by = ? WHERE id = ?",
    ).bind(decision, now(), access.user!.email, id).run();
    await notify(record.trainer_id, "job_decision", `Job application ${decision}`, "Your job application status has been updated.", "/trainer#jobs");
    await audit(access.user!.email, `job_application.${decision}`, "job_application", id, { jobId: record.job_id });
    return Response.json({ status: decision });
  } catch (error) {
    return apiError(error);
  }
}

