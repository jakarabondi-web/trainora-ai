import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { apiError, audit, database, id, now, notify } from "../../../../../lib/server/trainora-store";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await context.params;
    const body = await request.json() as { coverNote?: string; trainerId?: string };
    const user = await getChatGPTUser();
    const db = database();
    let trainerId: string | undefined;
    if (user) {
      const trainer = await db.prepare(
        "SELECT id FROM users WHERE email = ? AND role = 'trainer' AND status = 'active'",
      ).bind(user.email.toLowerCase()).first() as { id: string } | null;
      trainerId = trainer?.id;
    } else if (env.DEV_AUTH_BYPASS === "true") {
      trainerId = body.trainerId;
    }
    if (!trainerId) return Response.json({ error: "An approved trainer account is required to apply." }, { status: 403 });
    const eligibility = await db.prepare(
      `SELECT a.quality_score, a.application_status, j.required_quality_score,
        EXISTS(SELECT 1 FROM verification_checks v WHERE v.applicant_id = a.id AND v.status = 'passed'
          AND v.type IN ('identity_bundle','government_id')) AS identity_passed
       FROM applicants a JOIN jobs j ON j.id = ? WHERE a.user_id = ? AND j.status = 'published'`,
    ).bind(jobId, trainerId).first() as Record<string, unknown> | null;
    if (!eligibility) return Response.json({ error: "Job or approved trainer profile not found." }, { status: 404 });
    if (eligibility.application_status !== "approved" || !eligibility.identity_passed) {
      return Response.json({ error: "Complete the approval and identity gates before applying." }, { status: 409 });
    }
    if (Number(eligibility.quality_score) < Number(eligibility.required_quality_score)) {
      return Response.json({ error: "Your current quality score is below this job's eligibility threshold." }, { status: 409 });
    }
    const existing = await db.prepare("SELECT id FROM job_applications WHERE job_id = ? AND trainer_id = ?")
      .bind(jobId, trainerId).first();
    if (existing) return Response.json({ error: "You already applied to this job." }, { status: 409 });
    const applicationId = id("jobapp");
    const matchScore = Math.min(99, Math.round(Number(eligibility.quality_score) + 3));
    await db.prepare(
      `INSERT INTO job_applications
       (id, job_id, trainer_id, cover_note, status, match_score, applied_at)
       VALUES (?, ?, ?, ?, 'submitted', ?, ?)`,
    ).bind(applicationId, jobId, trainerId, body.coverNote ?? "", matchScore, now()).run();
    await notify(trainerId, "job_application", "Job application submitted", "Your job application is now awaiting client and quality review.", "/trainer#jobs");
    await audit(trainerId, "job.applied", "job_application", applicationId, { jobId, matchScore });
    return Response.json({ applicationId, status: "submitted", matchScore }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

