import { getCurrentUser } from "../../../../lib/server/current-user";
import { requestPayout } from "../../../../lib/server/payments";
import { apiError, audit } from "../../../../lib/server/trainora-store";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Sign in is required." }, { status: 403 });
    const body = await request.json() as { methodId?: string; amountCents?: number };
    if (!body.methodId || !Number.isFinite(body.amountCents) || Number(body.amountCents) <= 0) {
      return Response.json({ error: "A payout method and a positive amount are required." }, { status: 400 });
    }
    const payoutId = await requestPayout(user.id, body.methodId, Math.round(Number(body.amountCents)));
    await audit(user.id, "payout.requested", "payout", payoutId, { amountCents: body.amountCents });
    return Response.json({ id: payoutId, status: "processing" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && !error.message.includes("not connected")) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return apiError(error);
  }
}
