import { audit, database, notify, now } from "./trainora-store";

export type ApprovalGates = {
  email_verified_at: string | null;
  identity_passed: number;
  selfie_passed: number;
  credentials_passed: number;
  account_risk_passed: number;
  assessment_passed: number;
};

export async function getApprovalGates(applicantId: string): Promise<ApprovalGates | null> {
  return await database().prepare(
    `SELECT
      (SELECT email_verified_at FROM users WHERE id = a.user_id) AS email_verified_at,
      EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type IN ('identity_bundle','government_id') AND v.status = 'passed') AS identity_passed,
      EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type IN ('selfie_liveness','identity_bundle') AND v.status = 'passed') AS selfie_passed,
      EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type = 'credential' AND v.status = 'passed') AS credentials_passed,
      NOT EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.type IN ('email_domain_risk','duplicate_account') AND v.status != 'passed') AS account_risk_passed,
      EXISTS(SELECT 1 FROM assessment_attempts x WHERE x.applicant_id = a.id AND x.passed = 1 AND x.integrity_score >= 70) AS assessment_passed
     FROM applicants a WHERE a.id = ?`,
  ).bind(applicantId).first() as ApprovalGates | null;
}

export function failedApprovalGates(gates: ApprovalGates | null) {
  if (!gates) return ["applicant"];
  return [
    !gates.email_verified_at && "email",
    !gates.identity_passed && "government ID",
    !gates.selfie_passed && "selfie/liveness",
    !gates.credentials_passed && "credentials",
    !gates.account_risk_passed && "account risk",
    !gates.assessment_passed && "assessment",
  ].filter(Boolean) as string[];
}

export async function recordApplicantDecision(
  applicantId: string,
  decision: string,
  notes: string,
  actorEmail: string,
) {
  const db = database();
  const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(applicantId).first() as { user_id: string } | null;
  if (!applicant) return { ok: false as const, status: 404, error: "Applicant not found." };
  if (decision === "approved") {
    const missing = failedApprovalGates(await getApprovalGates(applicantId));
    if (missing.length) {
      return { ok: false as const, status: 409, error: `Approval locked: ${missing.join(", ")} must pass.`, missing };
    }
  }
  const stage = decision === "approved" ? "approved" : "human_review";
  await db.batch([
    db.prepare(
      `UPDATE applicants SET application_status = ?, current_stage = ?, admin_notes = ?,
       access_tier = ?, decided_at = ?, updated_at = ? WHERE id = ?`,
    ).bind(
      decision,
      stage,
      notes || null,
      decision === "approved" ? "trainer" : "review_only",
      ["approved", "rejected"].includes(decision) ? now() : null,
      now(),
      applicantId,
    ),
    ...(decision === "approved"
      ? [db.prepare("UPDATE users SET role = 'trainer', updated_at = ? WHERE id = ?").bind(now(), applicant.user_id)]
      : []),
  ]);
  await notify(
    applicant.user_id,
    "application_decision",
    `Application ${decision.replaceAll("_", " ")}`,
    decision === "approved"
      ? "Every mandatory quality gate passed. Your trainer workspace and eligible projects are now available."
      : notes || "Your application status has been updated.",
    decision === "approved" ? "/trainer" : "/apply",
  );
  await audit(actorEmail, `application.${decision}`, "applicant", applicantId, { notes });
  return { ok: true as const, status: 200, decision };
}
