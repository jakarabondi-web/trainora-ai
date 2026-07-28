import { adminOnly } from "../../../../lib/server/access";
import { apiError, database } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const db = database();
    const [totals, payouts] = await db.batch([
      db.prepare(
        `SELECT
          COALESCE(SUM(CASE WHEN status = 'available' THEN amount_cents ELSE 0 END), 0) AS available_cents,
          COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_cents ELSE 0 END), 0) AS pending_cents,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END), 0) AS paid_cents
         FROM earnings`,
      ),
      db.prepare(
        `SELECT p.*, u.full_name AS trainer_name FROM payouts p JOIN users u ON u.id = p.trainer_id
         ORDER BY p.requested_at DESC LIMIT 100`,
      ),
    ]);
    const summary = (totals.results?.[0] ?? {}) as Record<string, number>;
    return Response.json({
      availableCents: Number(summary.available_cents ?? 0),
      pendingCents: Number(summary.pending_cents ?? 0),
      paidCents: Number(summary.paid_cents ?? 0),
      payouts: payouts.results ?? [],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}
