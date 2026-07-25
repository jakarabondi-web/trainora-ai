import { adminOnly } from "../../../../lib/server/access";
import { apiError, database } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const result = await database().prepare(
      `SELECT ja.id, ja.status, ja.match_score, ja.applied_at, ja.cover_note,
        j.title AS job_title, u.full_name AS trainer_name, u.email AS trainer_email,
        a.quality_score
       FROM job_applications ja
       JOIN jobs j ON j.id = ja.job_id
       JOIN users u ON u.id = ja.trainer_id
       JOIN applicants a ON a.user_id = ja.trainer_id
       ORDER BY ja.applied_at DESC`,
    ).all();
    return Response.json({ applications: result.results ?? [] });
  } catch (error) {
    return apiError(error);
  }
}

