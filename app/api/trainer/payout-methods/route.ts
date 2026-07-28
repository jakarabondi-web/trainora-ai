import { getCurrentUser } from "../../../../lib/server/current-user";
import { addPayoutMethod } from "../../../../lib/server/payments";
import { apiError, audit, database } from "../../../../lib/server/trainora-store";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const result = await database().prepare("SELECT * FROM payout_methods WHERE user_id = ? ORDER BY is_default DESC, created_at")
      .bind(user.id).all();
    return Response.json({ methods: result.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const body = await request.json() as { type?: string; label?: string; accountLast4?: string; isDefault?: boolean };
    const label = String(body.label ?? "").trim();
    if (!label) return Response.json({ error: "A label for this payout method is required." }, { status: 400 });
    const methodId = await addPayoutMethod(user.id, String(body.type ?? "bank_account"), label, { last4: String(body.accountLast4 ?? "") }, Boolean(body.isDefault));
    await audit(user.id, "payout_method.added", "payout_method", methodId, {});
    return Response.json({ id: methodId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
