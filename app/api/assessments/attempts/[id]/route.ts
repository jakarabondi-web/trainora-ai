import type { AssessmentQuestion } from "../../../../../lib/assessment-bank";
import { apiError, audit, database, now, notify } from "../../../../../lib/server/trainora-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const db = database();
    const attempt = await db.prepare(
      `SELECT aa.*, s.title, s.duration_minutes, s.pass_score, s.questions_json
       FROM assessment_attempts aa JOIN assessments s ON s.id = aa.assessment_id WHERE aa.id = ?`,
    ).bind(id).first() as Record<string, unknown> | null;
    if (!attempt) return Response.json({ error: "Assessment attempt not found." }, { status: 404 });
    if (attempt.status === "assigned") {
      await db.prepare("UPDATE assessment_attempts SET status = 'in_progress', started_at = ?, updated_at = ? WHERE id = ?")
        .bind(now(), now(), id).run();
    }
    const questions = (JSON.parse(String(attempt.questions_json)) as AssessmentQuestion[]).map(({ answer: _answer, ...question }) => question);
    const sections = [...new Set(questions.map((question) => question.section))].map((section) => ({
      name: section,
      questionCount: questions.filter((question) => question.section === section).length,
    }));
    return Response.json({
      attempt: {
        id,
        title: attempt.title,
        status: attempt.status === "assigned" ? "in_progress" : attempt.status,
        durationMinutes: attempt.duration_minutes,
        passScore: attempt.pass_score,
        sections,
        questions,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { answers } = await request.json() as { answers?: Record<string, number> };
    if (!answers) return Response.json({ error: "Assessment answers are required." }, { status: 400 });
    const db = database();
    const attempt = await db.prepare(
      `SELECT aa.applicant_id, aa.status, aa.started_at, s.pass_score, s.questions_json, s.discipline
       FROM assessment_attempts aa JOIN assessments s ON s.id = aa.assessment_id WHERE aa.id = ?`,
    ).bind(id).first() as { applicant_id: string; status: string; started_at: string | null; pass_score: number; questions_json: string; discipline: string } | null;
    if (!attempt || !["assigned", "in_progress"].includes(attempt.status)) {
      return Response.json({ error: "This assessment cannot be submitted." }, { status: 409 });
    }
    const questions = JSON.parse(attempt.questions_json) as AssessmentQuestion[];
    const max = questions.reduce((sum, question) => sum + question.weight, 0);
    const earned = questions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? question.weight : 0), 0);
    const score = Math.round((earned / max) * 1000) / 10;
    const elapsedSeconds = attempt.started_at ? (Date.now() - new Date(attempt.started_at).getTime()) / 1000 : 0;
    const flags: string[] = [];
    if (elapsedSeconds > 0 && elapsedSeconds < questions.length * 8) flags.push("completion_speed_anomaly");
    if (new Set(Object.values(answers)).size === 1) flags.push("uniform_response_pattern");
    const integrityScore = Math.max(40, 100 - flags.length * 30);
    const sectionScores = Object.fromEntries(
      [...new Set(questions.map((question) => question.section))].map((section) => {
        const sectionQuestions = questions.filter((question) => question.section === section);
        const sectionMax = sectionQuestions.reduce((sum, question) => sum + question.weight, 0);
        const sectionEarned = sectionQuestions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? question.weight : 0), 0);
        return [section, Math.round((sectionEarned / sectionMax) * 1000) / 10];
      }),
    );
    const competencyScores = Object.fromEntries(
      [...new Set(questions.map((question) => question.competency))].map((competency) => {
        const competencyQuestions = questions.filter((question) => question.competency === competency);
        const competencyMax = competencyQuestions.reduce((sum, question) => sum + question.weight, 0);
        const competencyEarned = competencyQuestions.reduce((sum, question) => sum + (answers[question.id] === question.answer ? question.weight : 0), 0);
        return [competency, Math.round((competencyEarned / competencyMax) * 1000) / 10];
      }),
    );
    const benchmark = await db.prepare(
      `SELECT aa.score FROM assessment_attempts aa
       JOIN assessments s ON s.id = aa.assessment_id
       WHERE s.discipline = ? AND aa.status = 'submitted' AND aa.score IS NOT NULL`,
    ).bind(attempt.discipline).all() as { results?: Array<{ score: number }> };
    const priorScores = (benchmark.results ?? []).map((row) => Number(row.score));
    const percentile = priorScores.length
      ? Math.round((priorScores.filter((value) => value <= score).length / priorScores.length) * 100)
      : score;
    const rankBand = score >= 95 && percentile >= 90 ? "Exceptional"
      : score >= 88 ? "Advanced"
      : score >= 80 ? "Qualified"
      : score >= 70 ? "Borderline"
      : "Below standard";
    const domainScore = Number(sectionScores["Domain expertise"] ?? 0);
    const passed = score >= Number(attempt.pass_score) && domainScore >= 75 && integrityScore >= 70;
    const applicant = await db.prepare("SELECT user_id FROM applicants WHERE id = ?").bind(attempt.applicant_id).first() as { user_id: string };
    await db.batch([
      db.prepare(
        `UPDATE assessment_attempts SET status = 'submitted', answers_json = ?, score = ?,
         integrity_score = ?, competency_scores_json = ?, percentile = ?, rank_band = ?,
         completion_seconds = ?, flags_json = ?, passed = ?, submitted_at = ?, updated_at = ? WHERE id = ?`,
      ).bind(
        JSON.stringify(answers),
        score,
        integrityScore,
        JSON.stringify({ sections: sectionScores, competencies: competencyScores }),
        percentile,
        rankBand,
        Math.round(elapsedSeconds),
        JSON.stringify(flags),
        passed ? 1 : 0,
        now(),
        now(),
        id,
      ),
      db.prepare(
        `UPDATE applicants SET current_stage = 'human_review', application_status = 'under_review',
         quality_score = ?, risk_score = ?, assessment_rank = ?, assessment_percentile = ?,
         access_tier = 'review_only', updated_at = ? WHERE id = ?`,
      ).bind(score, 100 - integrityScore, rankBand, percentile, now(), attempt.applicant_id),
    ]);
    await notify(
      applicant.user_id,
      "assessment_result",
      passed ? "Assessment passed" : "Assessment requires review",
      passed ? "Your assessment passed and your application is now awaiting final human review." : "Your assessment was not automatically passed. A reviewer will examine the evidence before a final decision.",
      "/trainer#application-status",
    );
    await audit(applicant.user_id, "assessment.submitted", "assessment_attempt", id, {
      score,
      domainScore,
      integrityScore,
      percentile,
      rankBand,
      flags,
      passed,
    });
    return Response.json({
      score,
      domainScore,
      integrityScore,
      percentile,
      rankBand,
      competencyScores,
      passed,
      nextStage: "human_review",
    });
  } catch (error) {
    return apiError(error);
  }
}
