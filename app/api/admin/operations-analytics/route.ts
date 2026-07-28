import { adminOnly } from "../../../../lib/server/access";
import { apiError, database } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const db = database();
    const [
      trainers,
      applicants,
      jobs,
      jobApplications,
      assessments,
      verification,
    ] = await db.batch([
      db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'trainer' AND status = 'active'"),
      db.prepare(`SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN application_status = 'under_review' THEN 1 ELSE 0 END), 0) AS in_review,
        COALESCE(SUM(CASE WHEN application_status = 'approved' THEN 1 ELSE 0 END), 0) AS approved,
        COALESCE(AVG(CASE WHEN quality_score > 0 THEN quality_score END), 0) AS average_quality
        FROM applicants`),
      db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END), 0) AS published FROM jobs"),
      db.prepare(`SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END), 0) AS assigned FROM job_applications`),
      db.prepare(`SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END), 0) AS passed,
        COALESCE(AVG(score), 0) AS average_score FROM assessment_attempts WHERE status = 'submitted'`),
      db.prepare(`SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status IN ('pending','in_progress','needs_review') THEN 1 ELSE 0 END), 0) AS pending,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) AS failed FROM verification_checks`),
    ]);
    const first = (value: { results?: unknown[] }) => (value.results?.[0] ?? {}) as Record<string, unknown>;
    return Response.json({
      generatedAt: new Date().toISOString(),
      trainers: first(trainers),
      applicants: first(applicants),
      jobs: first(jobs),
      jobApplications: first(jobApplications),
      assessments: first(assessments),
      verification: first(verification),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
