import { adminOnly } from "../../../../lib/server/access";
import { apiError, audit, database, id, now } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const result = await database().prepare(
      `SELECT i.*, o.name AS organization_name FROM invoices i
       JOIN organizations o ON o.id = i.organization_id ORDER BY i.created_at DESC LIMIT 200`,
    ).all();
    return Response.json({ invoices: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const body = await request.json() as { organizationId?: string; amountCents?: number; periodStart?: string; periodEnd?: string };
    if (!body.organizationId || !Number.isFinite(body.amountCents) || Number(body.amountCents) <= 0 || !body.periodStart || !body.periodEnd) {
      return Response.json({ error: "Organization, amount, and a billing period are required." }, { status: 400 });
    }
    const db = database();
    const organization = await db.prepare("SELECT id FROM organizations WHERE id = ?").bind(body.organizationId).first();
    if (!organization) return Response.json({ error: "Organization not found." }, { status: 404 });
    const invoiceId = id("invoice");
    await db.prepare(
      `INSERT INTO invoices (id, organization_id, amount_cents, status, period_start, period_end, created_at)
       VALUES (?, ?, ?, 'issued', ?, ?, ?)`,
    ).bind(invoiceId, body.organizationId, Math.round(Number(body.amountCents)), body.periodStart, body.periodEnd, now()).run();
    await audit(access.user!.email, "invoice.created", "invoice", invoiceId, { organizationId: body.organizationId });
    return Response.json({ id: invoiceId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
