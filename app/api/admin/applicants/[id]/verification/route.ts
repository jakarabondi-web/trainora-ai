import { adminOnly } from "../../../../../../lib/server/access";
import { apiError, audit, database, id, now } from "../../../../../../lib/server/trainora-store";

const allowedStatus = new Set(["passed", "failed", "needs_review"]);

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id: applicantId } = await context.params;
    const body = await request.json() as { type?: string; status?: string; score?: number; reason?: string };
    if (!body.type || !body.status || !allowedStatus.has(body.status)) {
      return Response.json({ error: "Verification type and valid status are required." }, { status: 400 });
    }
    const db = database();
    const existing = await db.prepare(
      "SELECT id FROM verification_checks WHERE applicant_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1",
    ).bind(applicantId, body.type).first() as { id: string } | null;
    const checkId = existing?.id ?? id("check");
    if (existing) {
      await db.prepare(
        `UPDATE verification_checks SET status = ?, score = ?, reason = ?, reviewed_by = ?,
         reviewed_at = ?, updated_at = ? WHERE id = ?`,
      ).bind(body.status, body.score ?? null, body.reason ?? null, access.user!.email, now(), now(), checkId).run();
    } else {
      await db.prepare(
        `INSERT INTO verification_checks
         (id, applicant_id, type, provider, status, score, reason, reviewed_by, reviewed_at, created_at, updated_at)
         VALUES (?, ?, ?, 'manual', ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(checkId, applicantId, body.type, body.status, body.score ?? null, body.reason ?? null, access.user!.email, now(), now(), now()).run();
    }
    await audit(access.user!.email, "verification.reviewed", "verification_check", checkId, { applicantId, ...body });
    return Response.json({ checkId, status: body.status });
  } catch (error) {
    return apiError(error);
  }
}

