import { adminOnly } from "../../../../../../lib/server/access";
import { apiError, audit, database, notify, now } from "../../../../../../lib/server/trainora-store";

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
    const db = database();
    const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(id).first() as { user_id: string } | null;
    if (!applicant) return Response.json({ error: "Applicant not found." }, { status: 404 });
    if (body.decision === "approved") {
      const gates = await db.prepare(
        `SELECT
          (SELECT email_verified_at FROM users WHERE id = a.user_id) AS email_verified_at,
          EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type IN ('identity_bundle','government_id') AND v.status = 'passed') AS identity_passed,
          EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type IN ('selfie_liveness','identity_bundle') AND v.status = 'passed') AS selfie_passed,
          EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type = 'credential' AND v.status = 'passed') AS credentials_passed,
          NOT EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type IN ('email_domain_risk','duplicate_account') AND v.status != 'passed') AS account_risk_passed,
          EXISTS(SELECT 1 FROM assessment_attempts x WHERE x.applicant_id = a.id AND x.passed = 1) AS assessment_passed
         FROM applicants a WHERE a.id = ?`,
      ).bind(id).first() as Record<string, unknown>;
      if (!gates.email_verified_at || !gates.identity_passed || !gates.selfie_passed || !gates.credentials_passed || !gates.account_risk_passed || !gates.assessment_passed) {
        return Response.json({
          error: "Approval is locked until email, identity, selfie/liveness, credentials, account-risk, and assessment gates have passed.",
          gates,
        }, { status: 409 });
      }
    }
    const stage = body.decision === "approved" ? "approved" : body.decision === "under_review" ? "human_review" : "human_review";
    await db.batch([
      db.prepare(
        `UPDATE applicants SET application_status = ?, current_stage = ?, admin_notes = ?,
         decided_at = ?, updated_at = ? WHERE id = ?`,
      ).bind(body.decision, stage, body.notes ?? null, ["approved", "rejected"].includes(body.decision) ? now() : null, now(), id),
      ...(body.decision === "approved"
        ? [db.prepare("UPDATE users SET role = 'trainer', updated_at = ? WHERE id = ?").bind(now(), applicant.user_id)]
        : []),
    ]);
    await notify(
      applicant.user_id,
      "application_decision",
      `Application ${body.decision.replaceAll("_", " ")}`,
      body.decision === "approved"
        ? "You passed every quality gate and are now eligible for matching projects."
        : body.notes || "Your application status has been updated.",
      "/trainer#application-status",
    );
    await audit(access.user!.email, `application.${body.decision}`, "applicant", id, { notes: body.notes ?? "" });
    return Response.json({ status: body.decision });
  } catch (error) {
    return apiError(error);
  }
}
