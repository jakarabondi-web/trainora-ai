import { adminOnly } from "../../../../../../lib/server/access";
import { apiError, audit, database, now } from "../../../../../../lib/server/trainora-store";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id: payoutId } = await context.params;
    const db = database();
    const payout = await db.prepare("SELECT id FROM payouts WHERE id = ? AND status = 'processing'").bind(payoutId).first();
    if (!payout) return Response.json({ error: "Payout not found or already settled." }, { status: 404 });
    await db.prepare("UPDATE payouts SET status = 'paid', paid_at = ? WHERE id = ?").bind(now(), payoutId).run();
    await audit(access.user!.email, "payout.marked_paid", "payout", payoutId, {});
    return Response.json({ status: "paid" });
  } catch (error) {
    return apiError(error);
  }
}
