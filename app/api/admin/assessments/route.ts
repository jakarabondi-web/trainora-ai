import { coreQualityQuestions } from "../../../../lib/assessment-bank";
import { adminOnly } from "../../../../lib/server/access";
import { apiError, audit, database, id, now } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const result = await database().prepare(
      `SELECT id, title, discipline, version, duration_minutes, pass_score, max_attempts, active, created_at
       FROM assessments ORDER BY created_at DESC`,
    ).all();
    return Response.json({ assessments: result.results ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const body = await request.json() as Record<string, unknown>;
    const assessmentId = id("assessment");
    const db = database();
    await db.prepare(
      `INSERT INTO assessments
       (id, title, discipline, version, duration_minutes, pass_score, max_attempts, questions_json, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    ).bind(
      assessmentId,
      String(body.title ?? "Trainora Core Quality & Integrity"),
      String(body.discipline ?? "All disciplines"),
      Number(body.version ?? 1),
      Number(body.durationMinutes ?? 25),
      Number(body.passScore ?? 80),
      Number(body.maxAttempts ?? 2),
      JSON.stringify(body.questions ?? coreQualityQuestions),
      now(),
      now(),
    ).run();
    await audit(access.user!.email, "assessment.created", "assessment", assessmentId);
    return Response.json({ assessmentId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

