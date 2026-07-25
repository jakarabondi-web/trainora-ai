import { apiError, audit, database, now } from "../../../../lib/server/trainora-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = database();
    const record = await db.prepare(
      `SELECT a.*, u.email, u.full_name, u.email_verified_at
       FROM applicants a JOIN users u ON u.id = a.user_id WHERE a.id = ?`,
    ).bind(id).first();
    if (!record) return Response.json({ error: "Application not found." }, { status: 404 });
    const checks = await db.prepare(
      "SELECT type, status, score, reason, updated_at FROM verification_checks WHERE applicant_id = ? ORDER BY created_at",
    ).bind(id).all();
    const attempt = await db.prepare(
      `SELECT aa.id, aa.status, aa.score, aa.integrity_score, aa.passed, s.title
       FROM assessment_attempts aa JOIN assessments s ON s.id = aa.assessment_id
       WHERE aa.applicant_id = ? ORDER BY aa.created_at DESC LIMIT 1`,
    ).bind(id).first();
    return Response.json({ application: record, checks: checks.results ?? [], assessment: attempt ?? null });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { submit?: boolean };
    if (!body.submit) return Response.json({ error: "No supported change supplied." }, { status: 400 });
    const db = database();
    const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(id).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Application not found." }, { status: 404 });
    const email = await db.prepare("SELECT email_verified_at FROM users WHERE id = ?").bind(applicant.user_id).first() as { email_verified_at: string | null };
    if (!email?.email_verified_at) {
      return Response.json({ error: "Verify your email before submitting." }, { status: 409 });
    }
    await db.prepare(
      `UPDATE applicants SET application_status = 'submitted', current_stage = 'identity_verification',
       submitted_at = ?, updated_at = ? WHERE id = ?`,
    ).bind(now(), now(), id).run();
    await audit(applicant.user_id, "application.submitted", "applicant", id);
    return Response.json({ status: "submitted", nextStage: "identity_verification" });
  } catch (error) {
    return apiError(error);
  }
}

