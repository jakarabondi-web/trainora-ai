import { getAssessmentBlueprint } from "../../../../lib/assessment-bank";
import { apiError, audit, database, id, now, notify } from "../../../../lib/server/trainora-store";

export async function POST(request: Request) {
  try {
    const { applicantId } = await request.json() as { applicantId?: string };
    if (!applicantId) return Response.json({ error: "Application is required." }, { status: 400 });
    const db = database();
    const applicant = await db.prepare("SELECT user_id, discipline FROM applicants WHERE id = ?").bind(applicantId).first() as { user_id: string; discipline: string } | null;
    if (!applicant) return Response.json({ error: "Application not found." }, { status: 404 });
    const blueprint = getAssessmentBlueprint(applicant.discipline || "Research");
    let assessment = await db.prepare(
      "SELECT id, max_attempts FROM assessments WHERE active = 1 AND discipline = ? ORDER BY version DESC LIMIT 1",
    ).bind(blueprint.discipline).first() as { id: string; max_attempts: number } | null;
    if (!assessment) {
      const assessmentId = id("assessment");
      await db.prepare(
        `INSERT INTO assessments
         (id, title, discipline, version, duration_minutes, pass_score, max_attempts, questions_json, active, created_at, updated_at)
         VALUES (?, ?, ?, 1, ?, ?, 2, ?, 1, ?, ?)`,
      ).bind(
        assessmentId,
        blueprint.title,
        blueprint.discipline,
        blueprint.durationMinutes,
        blueprint.passScore,
        JSON.stringify(blueprint.questions),
        now(),
        now(),
      ).run();
      assessment = { id: assessmentId, max_attempts: 2 };
    }
    const count = await db.prepare(
      "SELECT COUNT(*) AS total FROM assessment_attempts WHERE applicant_id = ? AND assessment_id = ?",
    ).bind(applicantId, assessment.id).first() as { total: number };
    if (Number(count.total) >= assessment.max_attempts) {
      return Response.json({ error: "The maximum number of assessment attempts has been reached." }, { status: 409 });
    }
    const attemptId = id("attempt");
    await db.batch([
      db.prepare(
        `INSERT INTO assessment_attempts
         (id, applicant_id, assessment_id, status, created_at, updated_at)
         VALUES (?, ?, ?, 'assigned', ?, ?)`,
      ).bind(attemptId, applicantId, assessment.id, now(), now()),
      db.prepare(
        "UPDATE applicants SET current_stage = 'pre_screening', application_status = 'under_review', updated_at = ? WHERE id = ?",
      ).bind(now(), applicantId),
    ]);
    await notify(applicant.user_id, "assessment_assigned", "Pre-screening assessment assigned", "Complete the quality and integrity assessment to continue your application.", `/apply?attempt=${attemptId}`);
    await audit(applicant.user_id, "assessment.assigned", "assessment_attempt", attemptId);
    return Response.json({
      attemptId,
      status: "assigned",
      maxAttempts: assessment.max_attempts,
      discipline: blueprint.discipline,
      title: blueprint.title,
    });
  } catch (error) {
    return apiError(error);
  }
}
