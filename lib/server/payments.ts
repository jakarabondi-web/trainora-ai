import { database, id, now } from "./trainora-store";

export async function trainerEarningsSummary(trainerId: string) {
  const db = database();
  const [totals, recent, methods, payouts] = await db.batch([
    db.prepare(
      `SELECT
        COALESCE(SUM(CASE WHEN status = 'available' THEN amount_cents ELSE 0 END), 0) AS available_cents,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_cents ELSE 0 END), 0) AS pending_cents,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END), 0) AS paid_cents,
        COALESCE(SUM(CASE WHEN status = 'paid' AND available_at >= ? THEN amount_cents ELSE 0 END), 0) AS week_cents
       FROM earnings WHERE trainer_id = ?`,
    ).bind(new Date(Date.now() - 7 * 24 * 60 * 60_000).toISOString(), trainerId),
    db.prepare("SELECT * FROM earnings WHERE trainer_id = ? ORDER BY created_at DESC LIMIT 25").bind(trainerId),
    db.prepare("SELECT * FROM payout_methods WHERE user_id = ? ORDER BY is_default DESC, created_at").bind(trainerId),
    db.prepare("SELECT * FROM payouts WHERE trainer_id = ? ORDER BY requested_at DESC LIMIT 10").bind(trainerId),
  ]);
  const summary = (totals.results?.[0] ?? {}) as Record<string, number>;
  return {
    availableCents: Number(summary.available_cents ?? 0),
    pendingCents: Number(summary.pending_cents ?? 0),
    paidCents: Number(summary.paid_cents ?? 0),
    weekCents: Number(summary.week_cents ?? 0),
    earnings: recent.results ?? [],
    payoutMethods: methods.results ?? [],
    payouts: payouts.results ?? [],
  };
}

export async function addEarning(trainerId: string, sourceType: string, sourceId: string, description: string, amountCents: number) {
  const db = database();
  await db.prepare(
    `INSERT INTO earnings (id, trainer_id, source_type, source_id, description, amount_cents, status, available_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'available', ?, ?)`,
  ).bind(id("earn"), trainerId, sourceType, sourceId, description, amountCents, now(), now()).run();
}

export async function addPayoutMethod(userId: string, type: string, label: string, details: Record<string, unknown>, makeDefault: boolean) {
  const db = database();
  const methodId = id("payoutmethod");
  const statements = [];
  if (makeDefault) {
    statements.push(db.prepare("UPDATE payout_methods SET is_default = 0 WHERE user_id = ?").bind(userId));
  }
  statements.push(db.prepare(
    `INSERT INTO payout_methods (id, user_id, type, label, details_json, is_default, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).bind(methodId, userId, type, label, JSON.stringify(details), makeDefault ? 1 : 0, now()));
  await db.batch(statements);
  return methodId;
}

export async function requestPayout(trainerId: string, methodId: string, amountCents: number) {
  const db = database();
  const method = await db.prepare("SELECT id FROM payout_methods WHERE id = ? AND user_id = ?").bind(methodId, trainerId).first();
  if (!method) throw new Error("Select a valid payout method.");
  const summary = await trainerEarningsSummary(trainerId);
  if (amountCents <= 0 || amountCents > summary.availableCents) throw new Error("Requested amount exceeds available earnings.");
  const payoutId = id("payout");
  const timestamp = now();
  const available = await db.prepare(
    "SELECT id, amount_cents FROM earnings WHERE trainer_id = ? AND status = 'available' ORDER BY created_at",
  ).bind(trainerId).all() as { results?: Array<{ id: string; amount_cents: number }> };
  let remaining = amountCents;
  const settleStatements = [];
  for (const earning of available.results ?? []) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, Number(earning.amount_cents));
    remaining -= take;
    settleStatements.push(db.prepare("UPDATE earnings SET status = 'paid' WHERE id = ?").bind(earning.id));
  }
  await db.batch([
    db.prepare(
      `INSERT INTO payouts (id, trainer_id, method_id, amount_cents, status, requested_at)
       VALUES (?, ?, ?, ?, 'processing', ?)`,
    ).bind(payoutId, trainerId, methodId, amountCents, timestamp),
    ...settleStatements,
  ]);
  return payoutId;
}
