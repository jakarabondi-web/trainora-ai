import { adminOnly } from "../../../../../../lib/server/access";
import { apiError, audit, database } from "../../../../../../lib/server/trainora-store";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const access = await adminOnly();
    if (access.response) return access.response;
    const { id: invoiceId } = await context.params;
    const db = database();
    const invoice = await db.prepare("SELECT id FROM invoices WHERE id = ?").bind(invoiceId).first();
    if (!invoice) return Response.json({ error: "Invoice not found." }, { status: 404 });
    await db.prepare("UPDATE invoices SET status = 'paid' WHERE id = ?").bind(invoiceId).run();
    await audit(access.user!.email, "invoice.marked_paid", "invoice", invoiceId, {});
    return Response.json({ status: "paid" });
  } catch (error) {
    return apiError(error);
  }
}
